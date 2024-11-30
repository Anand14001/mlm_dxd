import React, { useState } from 'react';
import "./ProductPage.css";
import { auth, } from "../firebase/firebase"; // Firebase Auth and Firestore instance
import {getFirestore, doc, setDoc, addDoc, collection  } from "firebase/firestore";


// Sample product data
const products = [
  {
    id: 1,
    name: "Sliding Aluminium Window",
    description: "A sleek and modern sliding aluminium window with customizable sizes.",
    image: "https://example.com/sliding-aluminium-window.jpg",
  },
  {
    id: 2,
    name: "Wooden Door",
    description: "A sturdy wooden door with a variety of styles and finishes.",
    image: "https://example.com/wooden-door.jpg",
  },
  {
    id: 3,
    name: "UPVC Window",
    description: "Durable and weather-resistant UPVC windows for all kinds of homes.",
    image: "https://example.com/upvc-window.jpg",

  },
  {
    id: 4,
    name: "French Door",
    description: "Elegant French doors with high-quality glass for a stylish entrance.",
    image: "https://example.com/french-door.jpg",

  },
  {
    id: 5,
    name: "Steel Window",
    description: "Strong and secure steel windows suitable for industrial buildings.",
    image: "https://example.com/steel-window.jpg",
  },
  {
    id: 6,
    name: "Casement Window",
    description: "Classic casement windows that open outward for optimal ventilation.",
    image: "https://example.com/casement-window.jpg",
 
  },
  {
    id: 7,
    name: "Wooden Sliding Window",
    description: "Beautiful wooden sliding windows that offer both style and functionality.",
    image: "https://example.com/wooden-sliding-window.jpg",
  },
  {
    id: 8,
    name: "Aluminium Sliding Door",
    description: "Sleek and modern aluminium sliding doors for patios and gardens.",
    image: "https://example.com/aluminium-sliding-door.jpg",

  },
  {
    id: 9,
    name: "Tilt and Turn Window",
    description: "Innovative tilt and turn windows offering both ventilation and security.",
    image: "https://example.com/tilt-turn-window.jpg",

  },
  {
    id: 10,
    name: "Bifold Door",
    description: "Foldable bifold doors that create a seamless transition between indoor and outdoor spaces.",
    image: "https://example.com/bifold-door.jpg",
  }
];

// ProductCard Component to display each product
const ProductCard = ({ product, onRequestQuote  }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <button className="buy-button" onClick={() => onRequestQuote(product)}>Request a quote</button>
    </div>
  );
};

// ProductPage Component to display all products
const ProductPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [additionalReq, setAdditionalReq] = useState('');
  const [errors, setErrors] = useState({});

  // Function to open modal when a quote is requested
  const handleRequestQuote = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const db = getFirestore(); 

  const handleProductSelection = (product) => {
    setSelectedProduct(product);
    setWidth('');
    setHeight('');
    setAdditionalReq('');
    setModalVisible(true);  // Show modal when a product is selected
  };

  const handleSubmitQuotation = async () => {
    let formErrors = {};

    // Validation
    if (!clientName) formErrors.clientName = 'Client Name is required';
    if (!clientPhone) formErrors.clientPhone = 'Client Phone is required';
    if (!clientEmail) formErrors.clientEmail = 'Client Email is required';
    if (!clientCity) formErrors.clientCity = 'City is required';
    if (!postalCode) formErrors.postalCode = 'Postal Code is required';
    if (selectedProductType === 'Select product') formErrors.selectedProductType = 'Please select a product';
    if (!width) formErrors.width = 'Width is required';
    if (!height) formErrors.height = 'Height is required';

    setErrors(formErrors);

    // Proceed only if there are no errors
    if (Object.keys(formErrors).length === 0) {
      try {
        const userId = auth.currentUser?.uid;

        if (!userId) {
          alert('User not authenticated. Please log in to submit the form.');
          return;
        }

        const formData = {
          userId, // Add user ID to track who filled the form
          product: selectedProduct,
          width,
          height,
          additionalReq,
          clientName,
          clientPhone,
          clientEmail,
          city: clientCity,
          postalCode,
          productType: selectedProductType,
          timestamp: new Date().toISOString(),
        };

        // Add a new document to the "Quotation_form_submission" collection
        await addDoc(collection(db, 'Quotation_form_submission'), formData);

        alert('Quotation submitted successfully!');
        setIsModalOpen(false); // Close modal after submission
        // Reset all form fields
        setSelectedProduct(null);
        setWidth('');
        setHeight('');
        setAdditionalReq('');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
        setClientCity('');
        setPostalCode('');
        setSelectedProductType('Select product');
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit the form. Please try again.');
      }
    }
  };

  return (
    <div className="product-page">
      <h1 className="page-title">Our Products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onRequestQuote={handleRequestQuote} />
        ))}
      </div>

      {/* Modal for Quotation Form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
          <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
            <h2>Request a Quote</h2>
            <div className="quotation-form">
              <h3>Client Details</h3>
              {/* Client Info Fields */}
              <div className="form-field">
                <label className="label">Client Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
                {errors.clientName && <div className="error">{errors.clientName}</div>}
              </div>
              <div className="form-field">
                <label className="label">Client Phone *</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
                {errors.clientPhone && <div className="error">{errors.clientPhone}</div>}
              </div>
              <div className="form-field">
                <label className="label">Client Email *</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.clientEmail && <div className="error">{errors.clientEmail}</div>}
              </div>
              <div className="form-field">
                <label className="label">City *</label>
                <input
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  placeholder="Enter city"
                />
                {errors.clientCity && <div className="error">{errors.clientCity}</div>}
              </div>
              <div className="form-field">
                <label className="label">Postal Code *</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Enter postal code"
                />
                {errors.postalCode && <div className="error">{errors.postalCode}</div>}
              </div>

              <h3>Product Details</h3>
              {/* Product Type */}
              <div className="form-field">
                <label className="label">Product Type *</label>
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                >
                  <option value="Select product">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {errors.selectedProductType && <div className="error">{errors.selectedProductType}</div>}
              </div>

              <div className="form-field">
                <label className="label">Width (in ft) *</label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Enter width"
                />
                {errors.width && <div className="error">{errors.width}</div>}
              </div>

              <div className="form-field">
                <label className="label">Height (in ft) *</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter height"
                />
                {errors.height && <div className="error">{errors.height}</div>}
              </div>

              <div className="form-field">
                <label className="label">Additional Requirements</label>
                <textarea
                  value={additionalReq}
                  onChange={(e) => setAdditionalReq(e.target.value)}
                  placeholder="Enter any special requests"
                />
              </div>

              <button className='submit-button' onClick={handleSubmitQuotation}>Submit Quotation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;