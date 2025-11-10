"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Trash2, Eye, EyeOff, Key, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  type ApiKey,
} from "@/app/api/api-key";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate calls (e.g., from React StrictMode)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const apiKeysList = await listApiKeys();
      setApiKeys(apiKeysList);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    try {
      setIsCreating(true);
      const response = await createApiKey({
        name: newKeyName,
        description: newKeyDescription.trim() || "Created via dashboard",
      });

      // The API should return the full key on creation.
      // Support multiple possible response shapes:
      // - { apiKey: "..." }                ← current backend
      // - { api_key: "..." }
      // - { data: { apiKey | api_key } }
      // - { key: "..." }
      const fullKey =
        (response as any)?.apiKey ||
        (response as any)?.api_key ||
        (response as any)?.data?.apiKey ||
        (response as any)?.data?.api_key ||
        (response as any)?.key ||
        "";
      if (fullKey) {
        setGeneratedKey(fullKey);
        setShowNewKey(true);
        toast.success("API Key generated successfully!");

        // Refresh the list
        await fetchApiKeys();
      } else {
        toast.error("Failed to generate API key - no key returned");
      }
    } catch (error: any) {
      console.error("Failed to create API key:", error);
      toast.error(error.response?.data?.message || "Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const handleRevokeKey = async (apiKeyId: string) => {
    try {
      await revokeApiKey({ apiKeyId });
      toast.success("API Key revoked successfully");
      // Refresh the list
      await fetchApiKeys();
    } catch (error: any) {
      console.error("Failed to revoke API key:", error);
      toast.error(error.response?.data?.message || "Failed to revoke API key");
    }
  };

  const formatKey = (key: string, showFull: boolean) => {
    if (showFull) return key;
    // Truncate: show first 8 chars and last 8 chars with ellipsis
    if (key.length <= 20) return key;
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading API keys...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys and access tokens
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for your application. Make sure to copy
                it as you won't be able to see it again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  disabled={showNewKey}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key-description">Description (Optional)</Label>
                <Input
                  id="key-description"
                  placeholder="e.g., Created for testing"
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  disabled={showNewKey}
                />
              </div>

              {showNewKey && generatedKey && (
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={generatedKey}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(generatedKey, "API Key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Copy this key now. You won't be able to see it again.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              {!showNewKey ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNewKeyName("");
                      setNewKeyDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey} disabled={isCreating}>
                    <Key className="h-4 w-4 mr-2" />
                    {isCreating ? "Creating..." : "Generate Key"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                    setNewKeyName("");
                    setNewKeyDescription("");
                    setGeneratedKey(null);
                    setShowNewKey(false);
                  }}
                >
                  Done
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Key className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No API keys yet. Create your first key to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => {
                  const isVisible = visibleKeys.has(apiKey.id);
                  const isRevoked = !apiKey.is_active || !!apiKey.revoked_at;
                  const keyToDisplay =
                    apiKey.key_preview || apiKey.api_key_hash || "";
                  const displayedKey = formatKey(keyToDisplay, isVisible);

                  return (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {displayedKey}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            disabled={isRevoked}
                            title={
                              isVisible ? "Hide full key" : "Show full key"
                            }
                          >
                            {isVisible ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDateShort(apiKey.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apiKey.last_used_at ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDateShort(apiKey.last_used_at)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            isRevoked
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {isRevoked ? "Revoked" : "Active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              copyToClipboard(keyToDisplay, "API Key")
                            }
                            disabled={isRevoked}
                            title="Copy full key"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRevokeKey(apiKey.id)}
                            disabled={isRevoked}
                            title="Revoke key"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
