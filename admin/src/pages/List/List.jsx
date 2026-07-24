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
  "Noodles"
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
        isFeatured: editData.isFeatured
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
