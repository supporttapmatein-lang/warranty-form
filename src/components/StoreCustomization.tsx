import React, { useState, useRef } from 'react';
import {
  Package,
  Store,
  Image as ImageIcon,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  UploadCloud,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Edit2,
  X,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import {
  AppConfig,
  DEFAULT_PRODUCTS,
  DEFAULT_PURCHASE_CHANNELS,
} from '../types/warranty';
import defaultCardImg from '../assets/images/tapmate_warranty_card_1791734734137.jpg';
import titaniumCardImg from '../assets/images/tapmate_titanium_card_1791763232690.jpg';
import pearlCardImg from '../assets/images/tapmate_silver_card_1791763248918.jpg';

interface StoreCustomizationProps {
  appConfig: AppConfig;
  onSaveConfig: (updated: Partial<AppConfig>) => Promise<void>;
}

export const StoreCustomization: React.FC<StoreCustomizationProps> = ({
  appConfig,
  onSaveConfig,
}) => {
  const [products, setProducts] = useState<string[]>(
    appConfig.products?.length ? appConfig.products : DEFAULT_PRODUCTS
  );
  const [channels, setChannels] = useState<string[]>(
    appConfig.purchaseChannels?.length
      ? appConfig.purchaseChannels
      : DEFAULT_PURCHASE_CHANNELS
  );
  const [cardImageUrl, setCardImageUrl] = useState<string>(
    appConfig.cardImageUrl || ''
  );

  // New item inputs
  const [newProductInput, setNewProductInput] = useState('');
  const [newChannelInput, setNewChannelInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  // Editing state for products and channels
  const [editingProductIdx, setEditingProductIdx] = useState<number | null>(null);
  const [editingProductVal, setEditingProductVal] = useState('');

  const [editingChannelIdx, setEditingChannelIdx] = useState<number | null>(null);
  const [editingChannelVal, setEditingChannelVal] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // PRESET CARDS
  const cardPresets = [
    {
      id: 'default',
      name: 'Studio Onyx & Cyan (Default)',
      url: defaultCardImg,
      desc: 'Embossed cyan typography on matte black with shield crest hologram',
    },
    {
      id: 'titanium',
      name: 'Cyber Carbon Titanium',
      url: titaniumCardImg,
      desc: 'Brushed dark gunmetal with laser electric cyan glow and chip',
    },
    {
      id: 'pearl',
      name: 'Frosted Pearl & Chrome',
      url: pearlCardImg,
      desc: 'Luxury brushed silver with blue foil lettering and holographic seal',
    },
  ];

  // Quick chips for products
  const productSuggestions = [
    'Tapmate GaN 120W Desktop Hub',
    'Tapmate MagPower Slim 5,000mAh',
    'Tapmate ArmorPro Kevlar Case',
    'Tapmate Car Vent MagMount Qi2',
  ];

  // Quick chips for purchase channels
  const channelSuggestions = [
    'Amazon India',
    'Flipkart',
    'Croma Electronics',
    'Reliance Digital',
    'Blinkit Quick Commerce',
  ];

  // --- PRODUCT HANDLERS ---
  const handleAddProduct = (nameToAdd?: string) => {
    const val = (nameToAdd || newProductInput).trim();
    if (!val) return;
    if (products.some((p) => p.toLowerCase() === val.toLowerCase())) {
      setFeedback({ type: 'error', message: `"${val}" is already in the product list.` });
      return;
    }
    setProducts((prev) => [...prev, val]);
    setNewProductInput('');
    setFeedback(null);
  };

  const handleStartEditProduct = (index: number) => {
    setEditingProductIdx(index);
    setEditingProductVal(products[index]);
  };

  const handleSaveEditProduct = () => {
    if (editingProductIdx === null) return;
    const trimmed = editingProductVal.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'Product name cannot be empty.' });
      return;
    }
    setProducts((prev) =>
      prev.map((item, idx) => (idx === editingProductIdx ? trimmed : item))
    );
    setEditingProductIdx(null);
    setEditingProductVal('');
    setFeedback(null);
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length <= 1) {
      setFeedback({ type: 'error', message: 'You must maintain at least one active product.' });
      return;
    }
    setProducts((prev) => prev.filter((_, i) => i !== index));
    if (editingProductIdx === index) {
      setEditingProductIdx(null);
    }
    setFeedback(null);
  };

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;
    setProducts((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleResetProducts = () => {
    setProducts(DEFAULT_PRODUCTS);
    setFeedback({ type: 'success', message: 'Reset product catalog to factory defaults.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- CHANNEL HANDLERS ---
  const handleAddChannel = (channelToAdd?: string) => {
    const val = (channelToAdd || newChannelInput).trim();
    if (!val) return;
    if (channels.some((c) => c.toLowerCase() === val.toLowerCase())) {
      setFeedback({ type: 'error', message: `"${val}" is already in the channels list.` });
      return;
    }
    setChannels((prev) => [...prev, val]);
    setNewChannelInput('');
    setFeedback(null);
  };

  const handleStartEditChannel = (index: number) => {
    setEditingChannelIdx(index);
    setEditingChannelVal(channels[index]);
  };

  const handleSaveEditChannel = () => {
    if (editingChannelIdx === null) return;
    const trimmed = editingChannelVal.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'Channel name cannot be empty.' });
      return;
    }
    setChannels((prev) =>
      prev.map((item, idx) => (idx === editingChannelIdx ? trimmed : item))
    );
    setEditingChannelIdx(null);
    setEditingChannelVal('');
    setFeedback(null);
  };

  const handleRemoveChannel = (index: number) => {
    if (channels.length <= 1) {
      setFeedback({ type: 'error', message: 'You must maintain at least one purchase channel.' });
      return;
    }
    setChannels((prev) => prev.filter((_, i) => i !== index));
    if (editingChannelIdx === index) {
      setEditingChannelIdx(null);
    }
    setFeedback(null);
  };

  const handleMoveChannel = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= channels.length) return;
    setChannels((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleResetChannels = () => {
    setChannels(DEFAULT_PURCHASE_CHANNELS);
    setFeedback({ type: 'success', message: 'Reset purchase channels to standard channels.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- CARD IMAGE HANDLERS ---
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please upload a valid image file (PNG, JPG, WEBP).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Card image size must be less than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCardImageUrl(reader.result as string);
      setFeedback({ type: 'success', message: 'Custom card image uploaded. Click "Save & Publish" to activate.' });
      setTimeout(() => setFeedback(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleSetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setFeedback({ type: 'error', message: 'Please enter a valid HTTP or HTTPS image URL.' });
      return;
    }
    setCardImageUrl(trimmed);
    setUrlInput('');
    setFeedback({ type: 'success', message: 'Custom image URL applied. Click "Save & Publish" to activate.' });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSelectPreset = (url: string) => {
    // If it's the default card, set empty string to use default
    if (url === defaultCardImg) {
      setCardImageUrl('');
    } else {
      setCardImageUrl(url);
    }
    setFeedback({ type: 'success', message: 'Preset design selected. Click "Save & Publish" to activate.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResetCard = () => {
    setCardImageUrl('');
    setFeedback({ type: 'success', message: 'Restored default Tapmate studio warranty card.' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // --- SAVE ALL TO FIRESTORE ---
  const handleSaveAll = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSaveConfig({
        products,
        purchaseChannels: channels,
        cardImageUrl,
      });
      setFeedback({
        type: 'success',
        message: 'Settings published to Firestore! Customers and visitors see changes in real-time.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update store settings in Firestore.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-10">
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#399FC5] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Portal Customization & Controls
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Products, Channels & Card Customization
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure dynamic products, allowed purchase channels, and the official warranty card image visible to all customers.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#399FC5] text-white text-xs sm:text-sm font-bold hover:bg-[#2e86a7] disabled:bg-slate-400 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#399FC5]/20 self-start sm:self-auto cursor-pointer"
        >
          {isSaving ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Publishing...' : 'Save & Publish Changes'}</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 1. Products Manager (Col 1-6) */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#399FC5]" />
              <h4 className="text-sm font-bold text-slate-900">
                Product Catalog ({products.length})
              </h4>
            </div>
            <button
              onClick={handleResetProducts}
              className="text-xs text-slate-500 hover:text-[#399FC5] flex items-center gap-1 font-semibold cursor-pointer"
              title="Reset products to default catalog"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            These products appear in the registration dropdown and auto-complete for customers.
          </p>

          {/* Quick-add suggestion chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {productSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddProduct(item)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-[#399FC5] hover:text-[#399FC5] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#399FC5]" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Product Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddProduct();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="e.g. Tapmate GaN 100W Travel Adapter"
              value={newProductInput}
              onChange={(e) => setNewProductInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Product Items List with Edit & Reorder */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 shadow-inner">
            {products.map((item, index) => (
              <div
                key={index}
                className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
              >
                {editingProductIdx === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingProductVal}
                      onChange={(e) => setEditingProductVal(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg border border-[#399FC5] text-xs bg-white focus:outline-none ring-2 ring-[#399FC5]/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditProduct();
                        if (e.key === 'Escape') setEditingProductIdx(null);
                      }}
                    />
                    <button
                      onClick={handleSaveEditProduct}
                      className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      title="Save name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingProductIdx(null)}
                      className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{item}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Reorder Up */}
                      <button
                        onClick={() => handleMoveProduct(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        onClick={() => handleMoveProduct(index, 'down')}
                        disabled={index === products.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEditProduct(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#399FC5] hover:bg-sky-50 transition-colors"
                        title="Edit product name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Purchase Channels Manager (Col 7-12) */}
        <div className="lg:col-span-6 space-y-4 p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#399FC5]" />
              <h4 className="text-sm font-bold text-slate-900">
                Purchase Channels ({channels.length})
              </h4>
            </div>
            <button
              onClick={handleResetChannels}
              className="text-xs text-slate-500 hover:text-[#399FC5] flex items-center gap-1 font-semibold cursor-pointer"
              title="Reset channels to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Allowed distributor and marketplace channels presented in the customer submission dropdown.
          </p>

          {/* Quick-add suggestion chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {channelSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddChannel(item)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-[#399FC5] hover:text-[#399FC5] transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#399FC5]" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Add Channel Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddChannel();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="e.g. Croma Electronics, Vijay Sales"
              value={newChannelInput}
              onChange={(e) => setNewChannelInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Channels List with Edit & Reorder */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/60 bg-white rounded-2xl border border-slate-200/80 shadow-inner">
            {channels.map((item, index) => (
              <div
                key={index}
                className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
              >
                {editingChannelIdx === index ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingChannelVal}
                      onChange={(e) => setEditingChannelVal(e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded-lg border border-[#399FC5] text-xs bg-white focus:outline-none ring-2 ring-[#399FC5]/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditChannel();
                        if (e.key === 'Escape') setEditingChannelIdx(null);
                      }}
                    />
                    <button
                      onClick={handleSaveEditChannel}
                      className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      title="Save name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingChannelIdx(null)}
                      className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{item}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Reorder Up */}
                      <button
                        onClick={() => handleMoveChannel(index, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Reorder Down */}
                      <button
                        onClick={() => handleMoveChannel(index, 'down')}
                        disabled={index === channels.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEditChannel(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#399FC5] hover:bg-sky-50 transition-colors"
                        title="Edit channel name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveChannel(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. Warranty Card Image Customizer (Full Width 12 Cols) */}
        <div className="lg:col-span-12 p-6 sm:p-8 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#399FC5]" />
              <h4 className="text-base font-bold text-slate-900">
                Official Warranty Card Visual Customizer
              </h4>
            </div>
            <button
              onClick={handleResetCard}
              className="text-xs text-slate-500 hover:text-[#399FC5] flex items-center gap-1 font-semibold self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Default Studio Card Image</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            Choose from official pre-rendered luxury Tapmate warranty cards below, upload your company&apos;s custom graphics, or paste a direct image URL. Any change made here updates the hero showcase and customer certificates in real time!
          </p>

          {/* PRESET DESIGNS GALLERY */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              1. Choose a Curated Tapmate Card Preset:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cardPresets.map((preset) => {
                const isSelected =
                  (!cardImageUrl && preset.id === 'default') ||
                  cardImageUrl === preset.url;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#399FC5] bg-sky-50/60 ring-2 ring-[#399FC5]/20 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 mb-2 border border-slate-200">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#399FC5] text-white p-1 rounded-full shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>{preset.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {preset.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPLOAD OR ENTER URL */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-4 border-t border-slate-200/60">
            {/* Left Controls: Upload File or Set URL */}
            <div className="md:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                2. Or Upload Custom Card Image:
              </span>

              {/* Upload File Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-6 border-2 border-dashed border-slate-300 hover:border-[#399FC5] rounded-2xl bg-white text-center cursor-pointer transition-all hover:bg-sky-50/40"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#399FC5] flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 hover:text-[#399FC5]">
                      Click to upload custom card image from computer
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WEBP (Max 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Or Set Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  3. Or Enter External Image URL:
                </label>
                <form onSubmit={handleSetUrl} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/tapmate-card.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#399FC5]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Apply URL
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Live Preview of Active Card */}
            <div className="md:col-span-5 flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 self-start flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#399FC5]" />
                Live Active Preview
              </span>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-300 bg-slate-900 aspect-[4/3] w-full max-w-sm group">
                <img
                  src={cardImageUrl || defaultCardImg}
                  alt="Tapmate Warranty Card Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center justify-between text-[11px] text-white">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#399FC5] animate-pulse" />
                    {cardImageUrl ? 'Custom Branded Card' : 'Default Official Card'}
                  </span>
                  <span className="text-slate-300 font-mono text-[10px]">4:3 Aspect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
