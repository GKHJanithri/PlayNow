import React, { useEffect, useState } from "react";
import "../Utils/Style.css";

const initialForm = {
  item_id: "",
  item_name: "",
  item_image: "",
  item_description: "",
  item_quantity_total: "",
  item_quantity_available: "",
};

function AdminItemsPage({ onBack }) {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async () => {
    try {
      setError("");
      const response = await fetch("http://localhost:5000/items");
      if (!response.ok) {
        if (response.status === 404) {
          setItems([]);
          return;
        }
        throw new Error("Failed to fetch items.");
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(fetchError.message || "Could not load items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((previous) => ({ ...previous, item_image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData(initialForm);
    setIsEditing(false);
    setEditingId("");
  };

  const validateForm = () => {
    if (
      !formData.item_id ||
      !formData.item_name ||
      !formData.item_image ||
      !formData.item_description ||
      formData.item_quantity_total === "" ||
      formData.item_quantity_available === ""
    ) {
      setError("Please fill all fields including image.");
      return false;
    }

    const total = Number(formData.item_quantity_total);
    const available = Number(formData.item_quantity_available);

    if (Number.isNaN(total) || Number.isNaN(available) || total < 0 || available < 0) {
      setError("Quantities must be valid positive numbers.");
      return false;
    }

    if (available > total) {
      setError("Available quantity cannot be greater than total quantity.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const payload = {
        item_id: Number(formData.item_id),
        item_name: formData.item_name.trim(),
        item_image: formData.item_image.trim(),
        item_description: formData.item_description.trim(),
        item_quantity_total: Number(formData.item_quantity_total),
        item_quantity_available: Number(formData.item_quantity_available),
      };

      const url = isEditing
        ? `http://localhost:5000/items/${editingId}`
        : "http://localhost:5000/items";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? "update" : "create"} item.`);
      }

      await fetchItems();
      resetForm();
    } catch (submitError) {
      setError(submitError.message || "Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);
    setError("");
    setFormData({
      item_id: item.item_id ?? "",
      item_name: item.item_name ?? "",
      item_image: item.item_image ?? "",
      item_description: item.item_description ?? "",
      item_quantity_total: item.item_quantity_total ?? "",
      item_quantity_available: item.item_quantity_available ?? "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setError("");
      const response = await fetch(`http://localhost:5000/items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item.");
      }

      await fetchItems();
    } catch (deleteError) {
      setError(deleteError.message || "Delete failed.");
    }
  };

  return (
    <main className="main-item-page">
      <section className="admin-layout">
        <header className="page-header">
          <p className="breadcrumb">SLIIT Sports &gt; Item Admin</p>
          <h1>Item Admin Dashboard</h1>
          {onBack && (
            <button className="history-btn" onClick={onBack}>
              Back to Items
            </button>
          )}
        </header>

        <article className="admin-card">
          <h2>{isEditing ? "Update Item" : "Create New Item"}</h2>
          <form className="admin-form" onSubmit={handleSubmit}>
           <div className="form-row">
             <input
              className="admin-input"
               type="number"
               name="item_id"
               placeholder="Item ID"
                value={formData.item_id}
               onChange={handleChange}
               disabled={isEditing}
              />
  <input
    className="admin-input"
    type="text"
    name="item_name"
    placeholder="Item Name"
    value={formData.item_name}
    onChange={handleChange}
  />
</div>

<div className="image-upload">
  {formData.item_image ? (
    <img src={formData.item_image} alt="preview" className="upload-preview" />
  ) : (
    <span className="upload-text">Upload item image</span>
  )}

  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
  />
</div>

<textarea
  className="admin-input admin-textarea"
  name="item_description"
  placeholder="Item Description"
  value={formData.item_description}
  onChange={handleChange}
/>

<div className="form-row">
  <input
    className="admin-input"
    type="number"
    name="item_quantity_total"
    placeholder="Total Quantity"
    value={formData.item_quantity_total}
    onChange={handleChange}
  />
  <input
    className="admin-input"
    type="number"
    name="item_quantity_available"
    placeholder="Available Quantity"
    value={formData.item_quantity_available}
    onChange={handleChange}
  />
</div>

<div className="admin-actions">
  {isEditing && (
    <button className="cancel-btn" type="button" onClick={resetForm}>
      Cancel
    </button>
  )}
  <button className="confirm-btn" type="submit" disabled={isLoading}>
    {isLoading ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
  </button>
</div>
          </form>
          {error && <p className="admin-error">{error}</p>}
        </article>

        <article className="admin-card">
          <h2>Manage Items</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Available / Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id}>
                      <td>{item.item_id}</td>
                      <td>
                        <img
                          src={item.item_image}
                          alt={item.item_name}
                          className="admin-table-image"
                        />
                      </td>
                      <td>{item.item_name}</td>
                      <td>{item.item_description}</td>
                      <td>
                        {item.item_quantity_available} / {item.item_quantity_total}
                      </td>
                      <td className="admin-table-actions">
                        <button className="return-btn" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button className="return-btn" onClick={() => handleDelete(item._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}

export default AdminItemsPage;
