import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { FieldType, IColumn, ITable } from '@/types/schemas/table';
import { useServices } from '@/hooks/useServices';
import { useParams } from 'next/navigation';

const BoardLeftSidebar = ({ collections, selectedCollection, selectCollection, onAddCollection, onDeleteCollection }: {
  collections: {
    id: string,
    name: string,
  }[], selectedCollection: string | null, selectCollection: (id: string) => void, onAddCollection: (id: string, name: string, columns: IColumn[], onAdd: () => void) => void, onDeleteCollection: (id: string) => void
}) => {
  const { id } = useParams();
  const { tableService } = useServices();
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [createCollectionLoading, setCreateCollectionLoading] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Validate against allowed pattern
    if (/^[a-zA-Z0-9_]*$/.test(value)) {
      setNewCollectionName(value);
      setError(null);
    } else {
      setError("Only letters, numbers, and '_' allowed");
    }
  };

  const addCollection = () => {
    setCreateCollectionLoading(true);
    const columns = [
      {
        id: uuidv4(),
        name: "_id",
        type: FieldType.primary,
        required: true,
        unique: true,
        default: "",
        list: false,
        primary: true,
      } as IColumn
    ];
    const newCollection = {
      data: {
        name: newCollectionName,
        columns: columns
      },
      id: uuidv4(),
      position: { x: 100, y: 100 },
      projectID: id as string,
      type: "collection"
    } as ITable;
    tableService.createTable(newCollection).then((res) => {
      if (res.status === 201 || res.status === 200) {
        setError(null);
        onAddCollection(newCollection.id, newCollectionName, columns, () => {
          setNewCollectionName("");
        });
        setCreateCollectionLoading(false);
      } else {
        setError(res.message || "Failed to create collection");
        setCreateCollectionLoading(false);
      }
    }).catch((err) => {
      setError(err.message || "Failed to create collection");
      setCreateCollectionLoading(false);
    });
  }

  return (
    <div className='w-full h-full bg-[#1A1C1E] border-r border-white/5'>
      <div className='flex flex-col h-full'>
        <div className='flex flex-col p-4'>
          <h1 className='text-white text-xl font-bold mb-3'>Collections</h1>
          <div>
            <Input onChange={(e) => handleChange(e)} value={newCollectionName} placeholder='New collection name' />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <Button onClick={addCollection} loading={createCollectionLoading} size="lg" className='w-full mt-3'>Add</Button>
        </div>
        <div className='flex flex-col gap-y-2 px-4 py-2 flex-1'>
          {
            collections.map((col) => {
              return <li
                key={col.id}
                className={`border border-white/5 group duration-300 hover:bg-white/5 font-semibold py-3 px-4 flex justify-between items-center rounded-lg ${selectedCollection == col.id ? "bg-white/5" : ""}`}
                onClick={() => selectCollection(col.id)}
              >
                {col.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCollection(col.id);
                  }}
                >
                  <div className="duration-300 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto h-7 w-7 font-bold flex items-center justify-center"><Trash2 className="text-white/50" height={18} width={18} /></div>
                </button>
              </li>;
            })
          }

        </div>
      </div>
    </div>
  )
}

export default BoardLeftSidebar