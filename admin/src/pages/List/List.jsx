import React, { useEffect, useState } from 'react'
import "./List.css"
import axios from 'axios'
import { toast } from 'react-toastify'

const FOOD_CATEGORIES = [
  "Salad",
  "Rolls",
  "Deserts",
  "Sandwich",
  "Cake",
  "Pure Veg",
  "Pasta",
  "Noodles",
  "Drinks"
]

const List = ({ url }) => {

  const [list, setList] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    category: "Salad",
    price: "",
    isFeatured: false
  });
  const [editCustomization, setEditCustomization] = useState({
    addOnsEnabled: false,
    addOns: [{ name: "", price: "" }],
    spiceLevelEnabled: false,
    notesEnabled: true
  });

  const apiUrl = url;

  const fetchList = async () => {
    const response = await axios.get(`${apiUrl}/api/food/list`);
    // console.log(response.data);
    if (response.data.success) {
      setList(response.data.data);

    } else {
      toast.error("Error fetching list")
    }
  }


  const removeFood = async (foodId) => {
    // console.log(foodId);
    const response = await axios.post(`${apiUrl}/api/food/remove`, {id:foodId})
    await fetchList();
    if(response.data.success){
      toast.success(response.data.message)
    }else{
      toast.error("Error")
    }
  }

  const startEdit = (item) => {
    setEditingItemId(item._id);
    setEditData({
      id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      isFeatured: item.isFeatured
    })
    setEditCustomization({
      addOnsEnabled: item.customization?.addOnsEnabled || false,
      addOns: item.customization?.addOns?.length ? item.customization.addOns.map((a) => ({ name: a.name, price: a.price })) : [{ name: "", price: "" }],
      spiceLevelEnabled: item.customization?.spiceLevelEnabled || false,
      notesEnabled: item.customization?.notesEnabled !== false
    })
  }

  const cancelEdit = () => {
    setEditingItemId(null);
    setIsUpdating(false);
    setEditData({
      id: "",
      name: "",
      description: "",
      category: "Salad",
      price: "",
      isFeatured: false
    })
    setEditCustomization({
      addOnsEnabled: false,
      addOns: [{ name: "", price: "" }],
      spiceLevelEnabled: false,
      notesEnabled: true
    })
  }

  const onEditAddOnChange = (index, field, value) => {
    setEditCustomization((prev) => {
      const addOns = [...prev.addOns];
      addOns[index] = { ...addOns[index], [field]: value };
      return { ...prev, addOns };
    })
  }

  const addEditAddOnRow = () => {
    setEditCustomization((prev) => ({ ...prev, addOns: [...prev.addOns, { name: "", price: "" }] }))
  }

  const removeEditAddOnRow = (index) => {
    setEditCustomization((prev) => ({ ...prev, addOns: prev.addOns.filter((_, i) => i !== index) }))
  }

  const onEditChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const saveEdit = async () => {
    if (!editData.name.trim() || !editData.description.trim() || !editData.category || editData.price === "") {
      toast.error("Please complete all fields before saving")
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.post(`${apiUrl}/api/food/update`, {
        id: editData.id,
        name: editData.name,
        description: editData.description,
        category: editData.category,
        price: Number(editData.price),
        isFeatured: editData.isFeatured,
        customization: {
          ...editCustomization,
          addOns: editCustomization.addOns
            .filter((a) => a.name.trim())
            .map((a) => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
        }
      })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
        cancelEdit();
      } else {
        toast.error(response.data.message || "Error updating food item")
      }
    } catch (error) {
      toast.error("Error updating food item")
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  return (
    <div className='list add flex-col'>
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Featured</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => (
          <React.Fragment key={index}>
            <div className="list-table-format">
              <img src={`${apiUrl}/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{item.price}</p>
              <p>
                <span className={`list-featured-badge ${item.isFeatured ? 'active' : ''}`}>
                  {item.isFeatured ? 'Yes' : 'No'}
                </span>
              </p>
              <div className='list-actions'>
                <button
                  type='button'
                  className='list-action-btn'
                  onClick={() => startEdit(item)}
                >
                  Edit
                </button>
                <button
                  type='button'
                  onClick={() => removeFood(item._id)}
                  className='list-action-btn list-action-btn-danger'
                >
                  Delete
                </button>
              </div>
            </div>
            {editingItemId === item._id && (
              <div className='list-item-editor'>
                <h4>Edit food item</h4>
                <div className='list-item-editor-grid'>
                  <label>
                    <span>Name</span>
                    <input
                      type='text'
                      name='name'
                      value={editData.name}
                      onChange={onEditChange}
                    />
                  </label>
                  <label>
                    <span>Category</span>
                    <select name='category' value={editData.category} onChange={onEditChange}>
                      {FOOD_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Price</span>
                    <input
                      type='number'
                      min='0'
                      name='price'
                      value={editData.price}
                      onChange={onEditChange}
                    />
                  </label>
                  <label className='list-item-editor-featured'>
                    <input
                      type='checkbox'
                      name='isFeatured'
                      checked={editData.isFeatured}
                      onChange={onEditChange}
                    />
                    <span>Featured dish</span>
                  </label>
                  <label className='list-item-editor-description'>
                    <span>Description</span>
                    <textarea
                      rows='4'
                      name='description'
                      value={editData.description}
                      onChange={onEditChange}
                    />
                  </label>
                </div>

                <div className='list-item-editor-customization'>
                  <h5>PDP customization options</h5>

                  <label className='list-item-editor-featured'>
                    <input
                      type='checkbox'
                      checked={editCustomization.addOnsEnabled}
                      onChange={(e) => setEditCustomization((prev) => ({ ...prev, addOnsEnabled: e.target.checked }))}
                    />
                    <span>Allow add-ons for this item</span>
                  </label>

                  {editCustomization.addOnsEnabled && (
                    <div className='list-editor-addons'>
                      {editCustomization.addOns.map((addOn, index) => (
                        <div className='list-editor-addon-row' key={index}>
                          <input
                            type='text'
                            placeholder='Add-on name (e.g. No Ice)'
                            value={addOn.name}
                            onChange={(e) => onEditAddOnChange(index, "name", e.target.value)}
                          />
                          <input
                            type='number'
                            min='0'
                            placeholder='Price (R)'
                            value={addOn.price}
                            onChange={(e) => onEditAddOnChange(index, "price", e.target.value)}
                          />
                          <button type='button' onClick={() => removeEditAddOnRow(index)} className='remove-addon-btn'>✕</button>
                        </div>
                      ))}
                      <button type='button' onClick={addEditAddOnRow} className='add-addon-btn'>+ Add another add-on</button>
                    </div>
                  )}

                  <label className='list-item-editor-featured'>
                    <input
                      type='checkbox'
                      checked={editCustomization.spiceLevelEnabled}
                      onChange={(e) => setEditCustomization((prev) => ({ ...prev, spiceLevelEnabled: e.target.checked }))}
                    />
                    <span>Allow spice level selection</span>
                  </label>

                  <label className='list-item-editor-featured'>
                    <input
                      type='checkbox'
                      checked={editCustomization.notesEnabled}
                      onChange={(e) => setEditCustomization((prev) => ({ ...prev, notesEnabled: e.target.checked }))}
                    />
                    <span>Allow allergy / special request notes</span>
                  </label>
                </div>

                <div className='list-item-editor-actions'>
                  <button type='button' className='list-editor-btn' onClick={cancelEdit}>Cancel</button>
                  <button type='button' className='list-editor-btn primary' disabled={isUpdating} onClick={saveEdit}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default List
