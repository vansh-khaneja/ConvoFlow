"""Workflows API supporting both SQLite and Postgres backends."""

from __future__ import annotations

import json
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from db import USING_POSTGRES, get_connection, list_columns


router = APIRouter(prefix="/workflows", tags=["workflows"])


def init_db() -> None:
    """Initialize workflows table. Called on app startup."""
    try:
        with get_connection() as conn:
            if USING_POSTGRES:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS workflows (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        data_json TEXT NOT NULL,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                    )
                    """
                )
            else:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS workflows (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        data_json TEXT NOT NULL,
                        created_at TEXT DEFAULT (datetime('now'))
                    )
                    """
                )

                columns = list_columns(conn, "workflows")
                if columns and "id" in columns:
                    cursor = conn.execute("PRAGMA table_info(workflows)")
                    rows = cursor.fetchall()
                    id_type = None
                    for row in rows:
                        col_name = row["name"] if isinstance(row, dict) else row[1]
                        if col_name == "id":
                            id_type = row["type"] if isinstance(row, dict) else row[2]
                            break
                    if id_type == "INTEGER":
                        conn.execute("BEGIN TRANSACTION")
                        try:
                            conn.execute(
                                """
                                CREATE TABLE IF NOT EXISTS workflows_new (
                                    id TEXT PRIMARY KEY,
                                    name TEXT NOT NULL,
                                    data_json TEXT NOT NULL,
                                    created_at TEXT DEFAULT (datetime('now'))
                                )
                                """
                            )
                            old_rows = conn.execute(
                                "SELECT id, name, data_json, created_at FROM workflows"
                            ).fetchall()
                            for row in old_rows:
                                conn.execute(
                                    "INSERT INTO workflows_new (id, name, data_json, created_at) VALUES (?, ?, ?, ?)",
                                    (str(uuid.uuid4()), row[1], row[2], row[3]),
                                )
                            conn.execute("DROP TABLE workflows")
                            conn.execute("ALTER TABLE workflows_new RENAME TO workflows")
                            conn.commit()
                        except Exception:
                            conn.rollback()
                            raise
    except Exception as e:
        print(f"Warning: Failed to initialize workflows database: {e}")
        print("The database will be initialized on first use.")


class WorkflowIn(BaseModel):
    name: str = Field(default="", description="Workflow name (auto-generated if empty)")
    data: Dict[str, Any] = Field(..., description="Workflow graph JSON")


def generate_workflow_name(conn) -> str:
    """Generate auto-increment workflow name like 'Untitled 1', 'Untitled 2', etc."""

    rows = conn.execute(
        "SELECT name FROM workflows WHERE name LIKE 'Untitled %' ORDER BY name"
    ).fetchall()

    existing_numbers: List[int] = []
    for row in rows:
        name = row["name"] if isinstance(row, dict) else row[0]
        if name.startswith("Untitled "):
            try:
                existing_numbers.append(int(name.replace("Untitled ", "")))
            except ValueError:
                continue

    next_num = 1
    while next_num in existing_numbers:
        next_num += 1
    return f"Untitled {next_num}"


@router.get("/", response_model=Dict[str, Any])
async def list_workflows():
    try:
        with get_connection() as conn:
            # Get all workflows with their data
            rows = conn.execute(
                "SELECT id, name, data_json, created_at FROM workflows ORDER BY created_at DESC"
            ).fetchall()
            
            items = []
            for row in rows:
                workflow = dict(row)
                workflow_id = workflow["id"]
                
                # Parse workflow data
                workflow_data = json.loads(workflow.get("data_json", "{}"))
                nodes = workflow_data.get("nodes", [])
                
                # Extract unique node types with their details
                unique_node_types = {}
                for node in nodes:
                    if node.get("data") and node["data"].get("nodeSchema"):
                        schema = node["data"]["nodeSchema"]
                        node_id = schema.get("node_id")
                        if node_id and node_id not in unique_node_types:
                            styling = schema.get("styling", {})
                            
                            # Try to get icon from styling.icon first, then from html_template
                            icon = styling.get("icon")
                            # Handle None, empty string, or whitespace-only strings
                            if not icon or (isinstance(icon, str) and not icon.strip()):
                                icon = None
                                # Try to extract SVG from html_template if icon is not directly available
                                html_template = styling.get("html_template")
                                if html_template and isinstance(html_template, str):
                                    import re
                                    svg_match = re.search(r'<svg[^>]*>[\s\S]*?</svg>', html_template, re.IGNORECASE)
                                    if svg_match:
                                        icon = svg_match.group(0)
                            
                            unique_node_types[node_id] = {
                                "node_id": node_id,
                                "name": schema.get("name", ""),
                                "icon": icon,
                                "icon_color": styling.get("border_color") or styling.get("background_color"),
                            }
                
                # Get deployment status
                deployment = conn.execute(
                    "SELECT is_active FROM deployments WHERE workflow_id = %s LIMIT 1"
                    if USING_POSTGRES
                    else "SELECT is_active FROM deployments WHERE workflow_id = ? LIMIT 1",
                    (workflow_id,),
                ).fetchone()
                
                is_deployed = False
                if deployment:
                    deployment_dict = dict(deployment)
                    is_deployed = deployment_dict.get("is_active") in (True, 1, "1")
                
                # Build response item
                item = {
                    "id": workflow_id,
                    "name": workflow["name"],
                    "created_at": workflow["created_at"],
                    "node_count": len(nodes),
                    "node_types": list(unique_node_types.values()),
                    "is_deployed": is_deployed,
                }
                
                items.append(item)
            
        return {"success": True, "data": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list workflows: {e}")


@router.get("/{workflow_id}", response_model=Dict[str, Any])
async def get_workflow(workflow_id: str):
    try:
        with get_connection() as conn:
            row = conn.execute(
                "SELECT id, name, data_json, created_at FROM workflows WHERE id = %s",
                (workflow_id,) if USING_POSTGRES else (workflow_id,),
            ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Workflow not found")
        item = dict(row)
        item["data"] = json.loads(item.pop("data_json"))
        return {"success": True, "data": item}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get workflow: {e}")


@router.post("/", response_model=Dict[str, Any])
async def save_workflow(payload: WorkflowIn):
    try:
        workflow_id = str(uuid.uuid4())
        with get_connection() as conn:
            workflow_name = payload.name.strip() if payload.name else ""
            if not workflow_name:
                workflow_name = generate_workflow_name(conn)

            conn.execute(
                "INSERT INTO workflows (id, name, data_json) VALUES (%s, %s, %s)"
                if USING_POSTGRES
                else "INSERT INTO workflows (id, name, data_json) VALUES (?, ?, ?)",
                (workflow_id, workflow_name, json.dumps(payload.data)),
            )
        return {"success": True, "data": {"id": workflow_id, "name": workflow_name}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save workflow: {e}")


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


@router.put("/{workflow_id}", response_model=Dict[str, Any])
async def update_workflow(workflow_id: str, payload: WorkflowUpdate):
    try:
        with get_connection() as conn:
            update_parts = []
            update_values: List[Any] = []

            if payload.name is not None:
                update_parts.append("name = %s" if USING_POSTGRES else "name = ?")
                update_values.append(payload.name)

            if payload.data is not None:
                update_parts.append("data_json = %s" if USING_POSTGRES else "data_json = ?")
                update_values.append(json.dumps(payload.data))

            if not update_parts:
                raise HTTPException(status_code=400, detail="No fields to update")

            update_values.append(workflow_id)

            query = f"UPDATE workflows SET {', '.join(update_parts)} WHERE id = %s"
            if not USING_POSTGRES:
                query = query.replace("%s", "?")

            cur = conn.execute(query, tuple(update_values))
            if hasattr(cur, "rowcount") and cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Workflow not found")
        return {"success": True, "data": {"id": workflow_id}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update workflow: {e}")


@router.delete("/{workflow_id}", response_model=Dict[str, Any])
async def delete_workflow(workflow_id: str):
    try:
        with get_connection() as conn:
            query = "DELETE FROM workflows WHERE id = %s"
            if not USING_POSTGRES:
                query = query.replace("%s", "?")
            cur = conn.execute(query, (workflow_id,))
            if hasattr(cur, "rowcount") and cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Workflow not found")
        return {"success": True, "data": {"id": workflow_id}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete workflow: {e}")

