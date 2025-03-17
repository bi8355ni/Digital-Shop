import React, { useState, useEffect } from "react";
import DynamicTable from "../../components/table";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null); // For editing and deleting
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          description: doc.data().description,
          imageUrl: doc.data().imageUrl,
        }));
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = (product) => {
    setSelectedProduct(product); // Set selected product for editing
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
    });
    setIsEditModalOpen(true);
  };
  
  const closeEditModal = () => setIsEditModalOpen(false);

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" && isNaN(value)) return;
    setNewProduct({ ...newProduct, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error message when user fixes the issue
  };

  const validateProduct = () => {
    const { name, price, description, imageUrl } = newProduct;
    let validationErrors = {};
    if (!name) validationErrors.name = "Product name is required.";
    if (!price) validationErrors.price = "Product price is required.";
    if (!description) validationErrors.description = "Product description is required.";
    if (!imageUrl) validationErrors.imageUrl = "Product image URL is required.";
    if (price && (isNaN(price) || Number(price) <= 0)) validationErrors.price = "Price must be a positive number.";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const addProduct = async () => {
    if (!validateProduct()) return;
    setAddProductLoading(true);
    try {
      const productData = {
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl || "", // Storing the URL directly
      };

      await addDoc(collection(db, "products"), productData);

      closeModal();

      const querySnapshot = await getDocs(collection(db, "products"));
      const fetchedProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        description: doc.data().description,
        imageUrl: doc.data().imageUrl,
      }));
      setProducts(fetchedProducts);

      setNewProduct({ name: "", price: "", description: "", imageUrl: "" });
      setAddProductLoading(false);
    } catch (error) {
      console.error("Error adding product:", error);
      setAddProductLoading(false);
    }
  };

  const editProduct = async () => {
    if (!validateProduct()) return;
    if (!selectedProduct) return;

    setAddProductLoading(true);
    try {
      const productRef = doc(db, "products", selectedProduct.id);
      const updatedProductData = {
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl || "", // Store the updated URL
      };

      await updateDoc(productRef, updatedProductData);
      setAddProductLoading(false);
      setProducts(products.map(product => product.id === selectedProduct.id ? { ...product, ...updatedProductData } : product));
      closeEditModal();
    } catch (error) {
      console.error("Error updating product:", error);
      setAddProductLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;

    setAddProductLoading(true);
    try {
      const productRef = doc(db, "products", selectedProduct.id);
      await deleteDoc(productRef);
      setProducts(products.filter(product => product.id !== selectedProduct.id));
      closeDeleteModal();
      setAddProductLoading(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      setAddProductLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={openModal}
        >
          Add Product
        </button>
      </div>
      <DynamicTable
        headings={["Name", "Price", "Description", "Image", "Actions"]}
        data={products.map((product) => ({
          ...product,
          image: product.imageUrl ? (
            <img src={product.imageUrl} alt="Product" className="w-16 h-16 object-contain" />
          ) : (
            "No Image"
          ),
          actions: (
            <div className="flex space-x-2">
              <button onClick={() => openEditModal(product)} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-700">Edit</button>
              <button onClick={() => openDeleteModal(product)} className="bg-red-500 text-white p-2 rounded hover:bg-red-700">Delete</button>
            </div>
          )
        }))}
        hasAction={false}
      />

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-1/2">
            <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
            <label className="block mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            <label className="block mb-2">Product Price</label>
            <input
              type="number"
              name="price"
              placeholder="Product Price"
              value={newProduct.price}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            <label className="block mb-2">Product Description</label>
            <textarea
              name="description"
              placeholder="Product Description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            <label className="block mb-2">Product Image URL</label>
            <input
              type="text"
              name="imageUrl"
              placeholder="Product Image URL"
              value={newProduct.imageUrl}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${addProductLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={addProduct}
                disabled={addProductLoading}
              >
                {addProductLoading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-1/2">
            <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
            <label className="block mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            <label className="block mb-2">Product Price</label>
            <input
              type="number"
              name="price"
              placeholder="Product Price"
              value={newProduct.price}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            <label className="block mb-2">Product Description</label>
            <textarea
              name="description"
              placeholder="Product Description"
              value={newProduct.description}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            <label className="block mb-2">Product Image URL</label>
            <input
              type="text"
              name="imageUrl"
              placeholder="Product Image URL"
              value={newProduct.imageUrl}
              onChange={handleInputChange}
              className="border p-2 mb-2 w-full"
              required
            />
            {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl}</p>}
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${addProductLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={editProduct}
                disabled={addProductLoading}
              >
                {addProductLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white p-5 rounded-lg w-1/3">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this product?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${addProductLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={deleteProduct}
                disabled={addProductLoading}
              >
                {addProductLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
