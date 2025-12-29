import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PricingConfig } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Calculator,
  Settings,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PricingAdmin() {
  const queryClient = useQueryClient();
  const [tiers, setTiers] = useState([]);
  const [settings, setSettings] = useState({
    variable: {
      max_price: 11,
      min_price: 10,
      anchor_quantity: 5000,
      exponent: 1.05
    },
    min_order_quantity: 50,
    max_ui_quantity: 1000
  });
  const [editingTier, setEditingTier] = useState(null);
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [previewQuantity, setPreviewQuantity] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const { data: config, isLoading } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: () => PricingConfig.getConfig(),
  });

  useEffect(() => {
    if (config) {
      setTiers(config.tiers || []);
      setSettings(config.settings || settings);
    }
  }, [config]);

  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data) => PricingConfig.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-config'] });
      setHasChanges(false);
      setSaveError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      console.error('Save error:', error);
      setSaveError(error.message || 'Failed to save pricing configuration');
      setSaveSuccess(false);
    }
  });

  const validateTiers = (tiersToValidate) => {
    const errors = [];
    const sorted = [...tiersToValidate].sort((a, b) => a.min_quantity - b.min_quantity);

    for (let i = 0; i < sorted.length; i++) {
      const tier = sorted[i];
      if (tier.min_quantity >= tier.max_quantity) {
        errors.push(`Tier ${i + 1}: Min quantity must be less than max quantity`);
      }
      if (tier.price_per_hat <= 0) {
        errors.push(`Tier ${i + 1}: Price must be positive`);
      }
      if (i > 0 && sorted[i].min_quantity <= sorted[i - 1].max_quantity) {
        errors.push(`Tier ${i + 1} overlaps with previous tier`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (!validateTiers(tiers)) return;

    setSaveError(null);
    setSaveSuccess(false);
    console.log('Saving pricing config:', { tiers, settings });
    saveMutation.mutate({ tiers, settings });
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: parseFloat(value) || 0 };
    setTiers(newTiers);
    setHasChanges(true);
    validateTiers(newTiers);
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newTier = {
      min_quantity: lastTier ? lastTier.max_quantity + 1 : settings.min_order_quantity,
      max_quantity: lastTier ? lastTier.max_quantity + 100 : settings.min_order_quantity + 49,
      price_per_hat: lastTier ? lastTier.price_per_hat - 1 : 16
    };
    setTiers([...tiers, newTier]);
    setHasChanges(true);
  };

  const handleDeleteTier = (index) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    setTiers(newTiers);
    setHasChanges(true);
    validateTiers(newTiers);
  };

  const handleMoveTier = (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === tiers.length - 1)
    ) return;

    const newTiers = [...tiers];
    const temp = newTiers[index];
    newTiers[index] = newTiers[index + direction];
    newTiers[index + direction] = temp;
    setTiers(newTiers);
    setHasChanges(true);
  };

  const handleSettingChange = (path, value) => {
    const newSettings = { ...settings };
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      newSettings[parent] = { ...newSettings[parent], [child]: parseFloat(value) || 0 };
    } else {
      newSettings[path] = parseFloat(value) || 0;
    }
    setSettings(newSettings);
    setHasChanges(true);
  };

  // Calculate price for preview
  const calculatePrice = (quantity) => {
    if (quantity < settings.min_order_quantity) {
      return { price: null, tier: null, type: 'below_moq' };
    }

    // Check tiers
    const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);
    for (const tier of sortedTiers) {
      if (quantity >= tier.min_quantity && quantity <= tier.max_quantity) {
        return { price: tier.price_per_hat, tier, type: 'tier' };
      }
    }

    // Variable pricing
    const lastTier = sortedTiers[sortedTiers.length - 1];
    if (lastTier && quantity > lastTier.max_quantity) {
      const { max_price, min_price, anchor_quantity, exponent } = settings.variable;
      const startQty = lastTier.max_quantity;

      const topLog = Math.log10(anchor_quantity);
      const minLog = Math.log10(startQty);
      const curLog = Math.log10(Math.max(startQty, quantity));
      const t = (topLog - curLog) / (topLog - minLog);

      const price = min_price + (max_price - min_price) * Math.pow(Math.max(0, t), exponent);
      return { price: Math.max(min_price, Math.min(max_price, price)), tier: null, type: 'variable' };
    }

    return { price: null, tier: null, type: 'no_tier' };
  };

  const preview = calculatePrice(previewQuantity);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing Configuration</h1>
          <p className="text-gray-600">Manage pricing tiers and volume discounts</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          className="bg-[var(--primary)] hover:bg-[var(--primary)]/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Save Success */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Pricing configuration saved successfully!</p>
        </div>
      )}

      {/* Save Error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Failed to save:</p>
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Please fix the following errors:</p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pricing Tiers */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Tiers
            </h2>
            <Button onClick={handleAddTier} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Tier
            </Button>
          </div>

          <div className="space-y-3">
            {tiers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pricing tiers defined. Add your first tier to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-gray-600">
                      <th className="py-2 text-left w-8"></th>
                      <th className="py-2 text-left">Min Qty</th>
                      <th className="py-2 text-left">Max Qty</th>
                      <th className="py-2 text-left">Price/Hat</th>
                      <th className="py-2 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveTier(index, -1)}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveTier(index, 1)}
                              disabled={index === tiers.length - 1}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2">
                          <Input
                            type="number"
                            value={tier.min_quantity}
                            onChange={(e) => handleTierChange(index, 'min_quantity', e.target.value)}
                            className="w-24"
                            min="1"
                          />
                        </td>
                        <td className="py-2">
                          <Input
                            type="number"
                            value={tier.max_quantity}
                            onChange={(e) => handleTierChange(index, 'max_quantity', e.target.value)}
                            className="w-24"
                            min="1"
                          />
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">$</span>
                            <Input
                              type="number"
                              value={tier.price_per_hat}
                              onChange={(e) => handleTierChange(index, 'price_per_hat', e.target.value)}
                              className="w-24"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTier(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Variable Pricing */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Variable Pricing (Above Last Tier)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              For quantities above {tiers.length > 0 ? tiers[tiers.length - 1]?.max_quantity : 'your tiers'},
              prices will smoothly decrease using a logarithmic curve.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price</label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">$</span>
                  <Input
                    type="number"
                    value={settings.variable.max_price}
                    onChange={(e) => handleSettingChange('variable.max_price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor Price</label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">$</span>
                  <Input
                    type="number"
                    value={settings.variable.min_price}
                    onChange={(e) => handleSettingChange('variable.min_price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anchor Quantity</label>
                <Input
                  type="number"
                  value={settings.variable.anchor_quantity}
                  onChange={(e) => handleSettingChange('variable.anchor_quantity', e.target.value)}
                  min="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curve Steepness</label>
                <Input
                  type="number"
                  value={settings.variable.exponent}
                  onChange={(e) => handleSettingChange('variable.exponent', e.target.value)}
                  min="0.5"
                  max="3"
                  step="0.05"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Global Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Global Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Quantity (MOQ)
                </label>
                <Input
                  type="number"
                  value={settings.min_order_quantity}
                  onChange={(e) => handleSettingChange('min_order_quantity', e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  UI Slider Maximum
                </label>
                <Input
                  type="number"
                  value={settings.max_ui_quantity}
                  onChange={(e) => handleSettingChange('max_ui_quantity', e.target.value)}
                  min="100"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Live Preview</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Quantity
                </label>
                <Input
                  type="number"
                  value={previewQuantity}
                  onChange={(e) => setPreviewQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                {preview.type === 'below_moq' ? (
                  <p className="text-red-600 text-sm">Below minimum order quantity ({settings.min_order_quantity})</p>
                ) : preview.type === 'no_tier' ? (
                  <p className="text-orange-600 text-sm">No tier defined for this quantity</p>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-[var(--primary)]">
                      ${preview.price?.toFixed(2)}/hat
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total: ${(preview.price * previewQuantity).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {preview.type === 'tier' ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Tier: {preview.tier.min_quantity}-{preview.tier.max_quantity}
                        </span>
                      ) : (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Variable Pricing
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium mb-2">Quick Reference</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Tiers are checked in order by quantity</li>
              <li>• Variable pricing uses logarithmic decay</li>
              <li>• Higher anchor = slower price drop</li>
              <li>• Higher exponent = steeper initial curve</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
