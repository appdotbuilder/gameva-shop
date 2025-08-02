
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import type { Product, Category, CreateProductInput, UpdateProductInput } from '../../../server/src/schema';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<CreateProductInput>({
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0,
    category_id: 0,
    images: [],
    featured: false
  });

  const [editProduct, setEditProduct] = useState<UpdateProductInput>({
    id: 0,
    name: '',
    description: null,
    price: 0,
    stock_quantity: 0,
    category_id: 0,
    images: [],
    featured: false
  });

  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await trpc.getProducts.query({
        search: searchTerm || undefined,
        category_id: selectedCategory === 'all' ? undefined : parseInt(selectedCategory),
        limit: 50,
        offset: 0
      });
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
      // Stub data for demonstration
      setProducts([
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
          images: ["https://images.unsplash.com/photo-1495474472287-4d71bcd d2085?w=400"],
          featured: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await trpc.getCategories.query();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Stub data for demonstration
      setCategories([
        { id: 1, name: "Electronics", description: "Tech gadgets and devices", created_at: new Date() },
        { id: 2, name: "Fashion", description: "Clothing and accessories", created_at: new Date() },
        { id: 3, name: "Home & Garden", description: "Items for your home", created_at: new Date() },
        { id: 4, name: "Sports", description: "Sports and fitness equipment", created_at: new Date() }
      ]);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const createProduct = async () => {
    if (!newProduct.name || newProduct.price <= 0 || newProduct.category_id === 0) return;

    try {
      const product = await trpc.createProduct.mutate(newProduct);
      setProducts((prev: Product[]) => [product, ...prev]);
      setIsCreateDialogOpen(false);
      setNewProduct({
        name: '',
        description: null,
        price: 0,
        stock_quantity: 0,
        category_id: 0,
        images: [],
        featured: false
      });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const updateProduct = async () => {
    if (!editProduct.name || (editProduct.price && editProduct.price <= 0)) return;

    try {
      const updated = await trpc.updateProduct.mutate(editProduct);
      setProducts((prev: Product[]) =>
        prev.map((p: Product) => p.id === updated.id ? updated : p)
      );
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      await trpc.deleteProduct.mutate({ id: productId });
      setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== productId));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      images: product.images,
      featured: product.featured
    });
    setIsEditDialogOpen(true);
  };

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

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📦 Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>➕ Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewProduct((prev: CreateProductInput) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newProduct.category_id.toString()}
                    onValueChange={(value: string) =>
                      setNewProduct((prev: CreateProductInput) => ({ ...prev, category_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newProduct.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewProduct((prev: CreateProductInput) => ({ ...prev, description: e.target.value || null }))
                  }
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewProduct((prev: CreateProductInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={newProduct.stock_quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewProduct((prev: CreateProductInput) => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={newProduct.images[0] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewProduct((prev: CreateProductInput) => ({ ...prev, images: e.target.value ? [e.target.value] : [] }))
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={newProduct.featured}
                  onCheckedChange={(checked: boolean) =>
                    setNewProduct((prev: CreateProductInput) => ({ ...prev, featured: checked }))
                  }
                />
                <Label htmlFor="featured">Featured product</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={createProduct} className="flex-1">
                  Create Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search Products</Label>
              <Input
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Filter by Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
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
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product: Product) => (
            <Card key={product.id}>
              <div className="relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-yellow-900">
                    ⭐ Featured
                  </Badge>
                )}
                <Badge className="absolute top-2 right-2 bg-blue-500">
                  {getCategoryName(product.category_id)}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-purple-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      className="flex-1"
                    >
                      ✏️ Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          🗑️ Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteProduct(product.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={editProduct.name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditProduct((prev: UpdateProductInput) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editProduct.category_id?.toString() || ''}
                    onValueChange={(value: string) =>
                      setEditProduct((prev: UpdateProductInput) => ({ ...prev, category_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editProduct.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditProduct((prev: UpdateProductInput) => ({ ...prev, description: e.target.value || null }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    value={editProduct.price || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditProduct((prev: UpdateProductInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Stock Quantity</Label>
                  <Input
                    type="number"
                    value={editProduct.stock_quantity || 0}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditProduct((prev: UpdateProductInput) => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))
                    }
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={editProduct.images?.[0] || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditProduct((prev: UpdateProductInput) => ({ ...prev, images: e.target.value ? [e.target.value] : [] }))
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={editProduct.featured || false}
                  onCheckedChange={(checked: boolean) =>
                    setEditProduct((prev: UpdateProductInput) => ({ ...prev, featured: checked }))
                  }
                />
                <Label htmlFor="edit-featured">Featured product</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={updateProduct} className="flex-1">
                  Update Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
