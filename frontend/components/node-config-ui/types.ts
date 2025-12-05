// Types for node configuration UI components

export interface UIOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface UIComponent {
  type: string;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  default_value?: any;
  placeholder?: string;
  disabled?: boolean;
  visible?: boolean;
  validation?: Record<string, any>;
  styling?: Record<string, any>;
  
  // Component-specific properties
  rows?: number;
  max_length?: number;
  min_length?: number;
  pattern?: string;
  options?: UIOption[];
  multiple?: boolean;
  searchable?: boolean;
  max_selections?: number;
  checked_value?: any;
  unchecked_value?: any;
  orientation?: string;
  min_value?: number;
  max_value?: number;
  step?: number;
  precision?: number;
  show_value?: boolean;
  format?: string;
  show_preset_colors?: boolean;
  accept?: string;
  max_file_size?: number;
  max_files?: number;
  min_date?: string;
  max_date?: string;
  text?: string;
  html?: boolean;
  thickness?: number;
  color?: string;
  button_text?: string;
  button_type?: string;
  variant?: string;
  size?: string;
  icon?: string;
  on_value?: any;
  off_value?: any;
}

export interface UIGroup {
  name: string;
  label: string;
  description?: string;
  components: UIComponent[];
  collapsible?: boolean;
  collapsed?: boolean;
  styling?: Record<string, any>;
}

export interface NodeUIConfig {
  node_id: string;
  node_name: string;
  groups: UIGroup[];
  global_styling?: Record<string, any>;
  layout?: string;
  columns?: number;
  dialog_config?: {
    title: string;
    description: string;
    width: string;
    height: string;
    background_color: string;
    border_color: string;
    text_color: string;
    icon?: string;
    icon_color?: string;
    header_background?: string;
    footer_background?: string;
    button_primary_color?: string;
    button_secondary_color?: string;
  };
}

export interface NodeTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ComponentProps {
  component: UIComponent;
  value: any;
  onChange: (value: any) => void;
  theme?: NodeTheme;
  disabled?: boolean;
  dynamicOptions?: Record<string, UIOption[]>;
  loadingOptions?: Set<string>;
  parameters?: Record<string, any>;
}

