'use client';

import { UIComponent, NodeTheme } from './types';
import {
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  Checkbox,
  Radio,
  NumberInput,
  Slider,
  Toggle,
  ColorPicker,
  FileUpload,
  DatePicker,
  Label,
  Divider,
  Button
} from './components';

interface ComponentRendererProps {
  component: UIComponent;
  value: any;
  onChange: (value: any) => void;
  theme?: NodeTheme;
  disabled?: boolean;
  dynamicOptions?: Record<string, any[]>;
  loadingOptions?: Set<string>;
  parameters?: Record<string, any>;
}

export function ComponentRenderer({
  component,
  value,
  onChange,
  theme,
  disabled,
  dynamicOptions,
  loadingOptions,
  parameters
}: ComponentRendererProps) {
  if (!component.visible) return null;

  const commonProps = {
    component,
    value,
    onChange,
    theme,
    disabled: disabled || component.disabled,
    dynamicOptions,
    loadingOptions,
    parameters
  };

  switch (component.type) {
    case 'text_input':
      return <TextInput {...commonProps} />;
    case 'textarea':
      return <Textarea {...commonProps} />;
    case 'select':
      return <Select {...commonProps} />;
    case 'multi_select':
      return <MultiSelect {...commonProps} />;
    case 'checkbox':
      return <Checkbox {...commonProps} />;
    case 'radio':
      return <Radio {...commonProps} />;
    case 'number_input':
      return <NumberInput {...commonProps} />;
    case 'slider':
      return <Slider {...commonProps} />;
    case 'toggle':
      return <Toggle {...commonProps} />;
    case 'color_picker':
      return <ColorPicker {...commonProps} />;
    case 'file_upload':
      return <FileUpload {...commonProps} />;
    case 'date_picker':
      return <DatePicker {...commonProps} />;
    case 'label':
      return <Label {...commonProps} />;
    case 'divider':
      return <Divider {...commonProps} />;
    case 'button':
      return <Button {...commonProps} />;
    default:
      return (
        <div className="text-red-400 text-sm">
          Unknown component type: {component.type}
        </div>
      );
  }
}

