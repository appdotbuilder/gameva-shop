
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product, Category } from '../../../server/src/schema';

interface ProductDetailProps {
  productId: number;
  onAddToCart: (productId: number, quantity: number) => void;
  onBack: () => void;
}

export function ProductDetail({ productId, onAddToCart, onBack }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use demo data directly since backend handlers are stubs
      const stubProducts: Product[] = [
        {
          id: 1,
          name: "Premium Wireless Headphones",
          description: "Experience superior sound quality with our premium wireless headphones. Featuring advanced noise cancellation technology, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers, professionals, and anyone who demands the best audio experience.",
          price: 299.99,
          stock_quantity: 50,
          category_id: 1,
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600"
          ],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: "Smart Fitness Watch",
          description: "Track your fitness goals with our advanced smart watch. Features heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life. Water-resistant design perfect for all your activities.",
          price: 199.99,
          stock_quantity: 30,
          category_id: 4,
          images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
            "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600"
          ],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name: "Portable Coffee Maker",
          description: "Perfect coffee anywhere you go with this compact and efficient coffee maker. Features quick brewing, easy cleanup, and works with ground coffee or pods.",
          price: 89.99,
          stock_quantity: 25,
          category_id: 3,
          images: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
          ],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 4,
          name: "Wireless Mouse",
          description: "Ergonomic design for productivity with precision tracking and long battery life.",
          price: 39.99,
          stock_quantity: 100,
          category_id: 1,
          images: [
            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"
          ],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 5,
          name: "Stylish Backpack",
          description: "Perfect for work or travel with multiple compartments and water-resistant material.",
          price: 79.99,
          stock_quantity: 40,
          category_id: 2,
          images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
          ],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 6,
          name: "LED Desk Lamp",
          description: "Adjustable brightness for any task with modern design and energy-efficient LED bulbs.",
          price: 49.99,
          stock_quantity: 60,
          category_id: 3,
          images: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
          ],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const foundProduct = stubProducts.find(p => p.id === productId);
      setProduct(foundProduct || stubProducts[0]);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const loadCategories = useCallback(async () => {
    try {
      // Use demo data directly since backend handlers are stubs
      const demoCategories: Category[] = [
        { id: 1, name: "Electronics", description: "Tech gadgets and devices", created_at: new Date() },
        { id: 2, name: "Fashion", description: "Clothing and accessories", created_at: new Date() },
        { id: 3, name: "Home & Garden", description: "Items for your home", created_at: new Date() },
        { id: 4, name: "Sports", description: "Sports and fitness equipment", created_at: new Date() }
      ];
      setCategories(demoCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [loadProduct, loadCategories]);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      onAddToCart(product.id, quantity);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="max-w-2xl mx-auto text-center">
        <CardContent className="p-8">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={onBack}>
            ← Back to Products
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="mb-4">
        ← Back to Products
      </Button>

      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative">
                {product.images[selectedImageIndex] ? (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center rounded-lg">
                    <span className="text-6xl">📦</span>
                  </div>
                )}
                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-yellow-500 text-yellow-900">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`h-20 w-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-purple-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <Badge className="mb-2 bg-blue-500 text-white">
                  {getCategoryName(product.category_id)}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="text-3xl font-bold text-purple-600 mb-4">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">📝 Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">📦 Stock Status</h3>
                  {product.stock_quantity > 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">✅ In Stock</span>
                      <span className="text-gray-600">({product.stock_quantity} available)</span>
                    </div>
                  ) : (
                    <span className="text-red-600">❌ Out of Stock</span>
                  )}
                </div>

                {product.stock_quantity > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold text-lg mb-2 block">
                        🔢 Quantity
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.max(1, Math.min(product.stock_quantity, val)));
                          }}
                          min="1"
                          max={product.stock_quantity}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                          disabled={quantity >= product.stock_quantity}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      size="lg"
                      className="w-full text-lg"
                    >
                      🛒 Add to Cart - ${(product.price * quantity).toFixed(2)}
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Product ID:</span> #{product.id}
                  </div>
                  <div>
                    <span className="font-medium">Added:</span> {product.created_at.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-semibold mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600">On orders over $50</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">↩️</div>
            <h3 className="font-semibold mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600">30-day return policy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">Quality Guarantee</h3>
            <p className="text-sm text-gray-600">100% satisfaction guaranteed</p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm text-center">
          🔔 This is a demo application. All product data and cart functionality is simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
