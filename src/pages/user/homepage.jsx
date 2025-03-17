import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Ensure you have react-router-dom installed
import { db } from "../../firebase"; // Ensure you have firebase configured
import { collection, getDocs } from "firebase/firestore";
import Slider from "react-slick"; // Ensure you have react-slick and slick-carousel installed
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const productsCollection = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollection);

      // Extract product data and include document ID
      const productsList = productsSnapshot.docs.map(doc => ({
        ...doc.data(), // Spread the data of the product
        id: doc.id, // Include the document ID
      }));

      setProducts(productsList);
    };

    fetchProducts();
  }, []);

  const handleCardClick = (productId) => {
    navigate(`/user/product/${productId}`);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="flex flex-col items-start">
      <Slider {...sliderSettings} className="w-full mb-6 ">
        <div>
          <img src="https://www.apple.com/v/product-red/z/images/meta/product_red__fcz9yyleim2y_og.png?202502171718" alt="Slide 1" className="w-full h-[55vh] object-cover" />
        </div>
        <div>
          <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D" alt="Slide 2" className="w-full h-[55vh] object-cover" />
        </div>
        <div>
          <img src="https://images.pexels.com/photos/279906/pexels-photo-279906.jpeg?cs=srgb&dl=pexels-pixabay-279906.jpg&fm=jpg" alt="Slide 3" className="w-full h-[55vh] object-cover" />
        </div>
      </Slider>
      <h1 className="text-3xl font-bold mb-6 px-5">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-7 mb-20">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => handleCardClick(product.id)}
          >
            <img
              src={product.imageUrl || "default-image-url.jpg"}
              alt={product.title}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <div className="p-4">
              <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-2">{product.author}</p>
              <p className="text-gray-500 mb-2">{product.description}</p>
              <p className="text-lg font-bold text-green-600">${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
