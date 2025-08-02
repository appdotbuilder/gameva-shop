
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Product, Category } from '../../../server/src/schema';

interface ProductListingProps {
  onViewProduct: (productId: number) => void;
}

export function ProductListing({ onViewProduct }: ProductListingProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

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

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use demo data directly since backend handlers are stubs
      const demoProducts: Product[] = [
        {
          id: 1,
          name: "Premium Wireless Headphones",
          description: "High-quality sound with noise cancellation",
          price: 299.99,
          stock_quantity: 50,
          category_id: 1,
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: "Smart Fitness Watch",
          description: "Track your fitness goals with style",
          price: 199.99,
          stock_quantity: 30,
          category_id: 4,
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"],
          featured: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          name: "Portable Coffee Maker",
          description: "Perfect coffee anywhere you go",
          price: 89.99,
          stock_quantity: 25,
          category_id: 3,
          images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 4,
          name: "Wireless Mouse",
          description: "Ergonomic design for productivity",
          price: 39.99,
          stock_quantity: 100,
          category_id: 1,
          images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 5,
          name: "Stylish Backpack",
          description: "Perfect for work or travel",
          price: 79.99,
          stock_quantity: 40,
          category_id: 2,
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 6,
          name: "LED Desk Lamp",
          description: "Adjustable brightness for any task",
          price: 49.99,
          stock_quantity: 60,
          category_id: 3,
          images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      // Simulate loading delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(demoProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === parseInt(selectedCategory);
    
    const matchesFeatured = !showFeaturedOnly || product.featured;
    
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🛍️ Our Products
        </h1>
        <p className="text-gray-600">
          Discover amazing products just for you
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              🔍 Search Products
            </label>
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              📂 Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className="w-full"
            >
              ⭐ Featured Only
            </Button>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setShowFeaturedOnly(false);
              }}
              className="w-full"
            >
              🔄 Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">😔</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all products
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setShowFeaturedOnly(false);
          }}>
            Show All Products
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                      ⭐ Featured
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                    {getCategoryName(product.category_id)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-purple-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button 
                      onClick={() => onViewProduct(product.id)}
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.stock_quantity > 0 ? (
                      <span className="text-green-600">✅ In Stock ({product.stock_quantity})</span>
                    ) : (
                      <span className="text-red-600">❌ Out of Stock</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm text-center">
          🔔 This is a demo application. All product data is simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
