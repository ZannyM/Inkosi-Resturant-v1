import React, { useState, useRef } from 'react'
import "./Add.css"
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({ url }) => {

    const apiUrl = url;

    //state variable
    const [image, setImage] = useState(false);
    const fileInputRef = useRef(null);
    const [data, setData] = useState({
        name: "",
        description: "",
        price: "",
        category: "Salad",   //default category when i reload page
        isFeatured: false
    })
    const [customization, setCustomization] = useState({
        addOnsEnabled: false,
        addOns: [{ name: "", price: "" }],
        spiceLevelEnabled: false,
        notesEnabled: true
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onAddOnChange = (index, field, value) => {
        setCustomization((prev) => {
            const addOns = [...prev.addOns];
            addOns[index] = { ...addOns[index], [field]: value };
            return { ...prev, addOns };
        })
    }

    const addAddOnRow = () => {
        setCustomization((prev) => ({ ...prev, addOns: [...prev.addOns, { name: "", price: "" }] }))
    }

    const removeAddOnRow = (index) => {
        setCustomization((prev) => ({ ...prev, addOns: prev.addOns.filter((_, i) => i !== index) }))
    }

    const resetForm = () => {
        setData({
            name: "",
            description: "",
            price: "",
            category: "Salad",
            isFeatured: false
        })
        setCustomization({
            addOnsEnabled: false,
            addOns: [{ name: "", price: "" }],
            spiceLevelEnabled: false,
            notesEnabled: true
        })
        setImage(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("name", data.name)
        formData.append("description", data.description)
        formData.append("price", Number(data.price))
        formData.append("category", data.category)
        formData.append("isFeatured", data.isFeatured)
        formData.append("image", image)
        formData.append("customization", JSON.stringify({
            ...customization,
            addOns: customization.addOns
                .filter((a) => a.name.trim())
                .map((a) => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
        }))
        //we will call the api
        try {
            const response = await axios.post(`${apiUrl}/api/food/add`, formData);
            if (response?.data?.success) {
                resetForm();
                toast.success(response.data.message)
                // toast.success(response.data.message)
            } else {
                toast.error(response?.data?.message || "Something went wrong while adding the dish")
            }
        } catch (error) {
            console.error(error)
            const message = error?.response?.data?.message || "Something went wrong"
            toast.error(message)
        }
    }

    // to check if data is getting updated when i type in the input fields, 
    // i can use useEffect to log the data state variable whenever it changes.
    //  This will help me debug and see if the data is being captured correctly.
    // useEffect(() => {
    //     console.log(data);
    // }, [data])

    return (
        <div className='add'>
            <form className="flex-col" onSubmit={onSubmitHandler}>
                <div className="add-img-ipload flex-col">
                    <p>Upload Image</p>
                    <label htmlFor="image">
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                    </label>
                    <input ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden required />
                </div>
                <div className="add-product-name flex-col">
                    <p>Product name</p>
                    <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Type here" />
                </div>
                <div className="add-product-description flex-col">
                    <p>Product description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder="Write content here" required />
                </div>
                <div className="add-category-price">
                    <div className="add-category flex-col">
                        <p>Product category</p>
                        <select onChange={onChangeHandler} value={data.category} name="category">
                            <option value="Salad">Salad</option>
                            <option value="Rolls">Rolls</option>
                            <option value="Deserts">Deserts</option>
                            <option value="Sandwich">Sandwich</option>
                            <option value="Cake">Cake</option>
                            <option value="Pure Veg">Pure Veg</option>
                            <option value="Pasta">Pasta</option>
                            <option value="Noodles">Noodles</option>
                            <option value="Drinks">Drinks</option>
                        </select>
                    </div>
                    <div className="add-price flex-col">
                        <p>Product price</p>
                        <input onChange={onChangeHandler} value={data.price} type="Number" name="price" placeholder='R229' />
                    </div>
                </div>
                <label className="add-featured-toggle">
                    <input
                        type="checkbox"
                        name="isFeatured"
                        checked={data.isFeatured}
                        onChange={onChangeHandler}
                    />
                    Set as featured dish on home page
                </label>

                <div className="add-customization flex-col">
                    <p>PDP customization options</p>

                    <label className="add-featured-toggle">
                        <input
                            type="checkbox"
                            checked={customization.addOnsEnabled}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, addOnsEnabled: e.target.checked }))}
                        />
                        Allow add-ons for this item
                    </label>

                    {customization.addOnsEnabled && (
                        <div className="add-customization-addons">
                            {customization.addOns.map((addOn, index) => (
                                <div className="add-addon-row" key={index}>
                                    <input
                                        type="text"
                                        placeholder="Add-on name (e.g. Extra Ice)"
                                        value={addOn.name}
                                        onChange={(e) => onAddOnChange(index, "name", e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Price (R)"
                                        value={addOn.price}
                                        onChange={(e) => onAddOnChange(index, "price", e.target.value)}
                                    />
                                    <button type="button" onClick={() => removeAddOnRow(index)} className="remove-addon-btn">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={addAddOnRow} className="add-addon-btn">+ Add another add-on</button>
                        </div>
                    )}

                    <label className="add-featured-toggle">
                        <input
                            type="checkbox"
                            checked={customization.spiceLevelEnabled}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, spiceLevelEnabled: e.target.checked }))}
                        />
                        Allow spice level selection
                    </label>

                    <label className="add-featured-toggle">
                        <input
                            type="checkbox"
                            checked={customization.notesEnabled}
                            onChange={(e) => setCustomization((prev) => ({ ...prev, notesEnabled: e.target.checked }))}
                        />
                        Allow allergy / special request notes
                    </label>
                </div>

                <button className='add-btn' type='submit'>ADD</button>


            </form>

        </div>
    )
}

export default Add
