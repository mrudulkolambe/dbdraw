import React, { useState } from 'react'
import { CollectionNodeType } from '../node';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { v4 as uuidv4 } from 'uuid';
import { getfieldTypeIcon } from '@/utils/fieldtype';
import { FieldType, IColumn } from '@/types/schemas/table';

interface RightSidebarProps {
  collection?: CollectionNodeType;
  onUpsertField: (tableId: string, column: IColumn) => void;
  setSelectedField: (field: IColumn | null) => void;
  selectedField: IColumn | null;
  onDeleteField: (tableId: string, fieldId: string) => void;
  isFieldUpdating: boolean;
}

const BoardRightSidebar = ({ collection, onUpsertField, onDeleteField, selectedField, setSelectedField, isFieldUpdating }: RightSidebarProps) => {
  const [fieldType, setFieldType] = useState<FieldType>(FieldType.string);
  const [fieldName, setFieldName] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldDefault, setFieldDefault] = useState("");
  const [fieldIsList, setFieldIsList] = useState(false);
  const [fieldUnique, setFieldUnique] = useState(false);

  const resetForm = () => {
    setFieldType(FieldType.string)
    setFieldName("")
    setFieldRequired(false)
    setFieldDefault("");
    setFieldIsList(false);
    setFieldUnique(false);
  }

  const deleteField = (fieldId: string) => {
    if (!collection) return;
    onDeleteField(collection.id, fieldId);
    setSelectedField(null);
    resetForm();
  }

  const upsertField = () => {
    if (!collection) return;
    const column: IColumn = {
      id: selectedField?.id || uuidv4(),
      name: fieldName,
      type: fieldType,
      required: fieldRequired,
      unique: fieldUnique,
      list: fieldIsList,
      default: fieldDefault,
      primary: true,
    };
    onUpsertField(collection.id, column);
    setSelectedField(null);
    resetForm();
  }

  const handleFieldSelect = (field: IColumn | null) => {
    setSelectedField(field);
    if (field) {
      setFieldName(field.name);
      setFieldType(field.type);
      setFieldRequired(field.required);
      setFieldDefault(field.default);
      setFieldIsList(field.list);
      setFieldUnique(field.unique);
    } else {
      resetForm();
    }
  }

  return (
    <div className="h-full w-full bg-[#1A1C1E] text-white flex flex-col py-4">
      <h1 className='text-white text-xl font-bold mb-3 px-4'>Field Details</h1>
      {collection ? (
        <>
          <div className="mb-4 px-4">
            <Input
              type="text"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Field name"
              className="mb-3"
            />
            <Select value={fieldType} onValueChange={(e) => setFieldType(e as FieldType)}>
              <SelectTrigger className="w-full text-white">
                <SelectValue placeholder="String" defaultValue={fieldType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FieldType.string}>String</SelectItem>
                <SelectItem value={FieldType.number}>Number</SelectItem>
                <SelectItem value={FieldType.date}>Date</SelectItem>
                <SelectItem value={FieldType.ref}>Reference</SelectItem>
                {/* <SelectItem value={FieldType.primary}>Primary</SelectItem> */}
                <SelectItem value={FieldType.boolean}>Boolean</SelectItem>
              </SelectContent>
            </Select>
            <label className="mt-4 flex items-center mb-2 gap-2">
              <Switch checked={fieldRequired} onCheckedChange={(e) => setFieldRequired(e)} />
              Required
            </label>
            <Input
              type="text"
              value={fieldDefault}
              onChange={(e) => setFieldDefault(e.target.value)}
              placeholder="Default value"
              className="mb-3"
            />
            <label className="flex items-center mb-2 gap-2">
              <Switch checked={fieldIsList} onCheckedChange={(e) => setFieldIsList(e)} />
              List
            </label>
            <label className="flex items-center mb-2 gap-2">
              <Switch checked={fieldUnique} onCheckedChange={(e) => setFieldUnique(e)} />
              Unique
            </label>
            <Button loading={isFieldUpdating} size={"lg"} className='w-full' onClick={upsertField} >Add/Update Field</Button>
          </div>
          <div className="flex-1 flex flex-col overflow-auto px-4">
            {collection.data.columns.map((field) => (
              <div
                key={field.name}
                className={`hover:bg-white/5 duration-300 group font-semibold border border-white/5 px-2 py-2 flex justify-between items-center mb-2  rounded-lg ${selectedField?.id === field.id ? "bg-white/5" : ""}`}
                onClick={() => field.type === FieldType.primary ? {} : handleFieldSelect(field)}
              >
                <span className="text-sm text-white gap-2 flex items-center flex-1 min-w-0">
                  <div className="text-white/60 h-8 w-8 bg-white/5 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0">{getfieldTypeIcon(field.type)}</div>
                  <p className='flex-1 truncate'>{field.name}</p>
                </span>
                {field.type !== FieldType.primary && <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteField(field.id);
                  }}
                >
                  <div className="duration-300 opacity-0 group-hover:opacity-100 h-7 w-7 hover:bg-white/10 rounded-md flex items-center justify-center"><Trash2 className="text-white/50" height={18} width={18} /></div>
                </button>}
              </div>
            ))}
          </div>
        </>
      ) : (
        <h2 className="text-xl font-semibold px-4">No collection selected</h2>
      )}
    </div>
  )
}

export default BoardRightSidebar