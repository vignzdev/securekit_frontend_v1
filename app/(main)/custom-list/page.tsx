"use client";
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import {
  createCustomListEntry,
  getCustomListEntries,
  type CustomListEntry,
  type CreateCustomListPayload,
} from "@/app/api/custom-list";

export default function CustomListPage() {
  const [activeTab, setActiveTab] = useState<"allowlist" | "blocklist">(
    "blocklist"
  );
  const [allowlistEntries, setAllowlistEntries] = useState<CustomListEntry[]>(
    []
  );
  const [blocklistEntries, setBlocklistEntries] = useState<CustomListEntry[]>(
    []
  );
  const [allowlistCount, setAllowlistCount] = useState(0);
  const [blocklistCount, setBlocklistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEntryValue, setNewEntryValue] = useState("");
  const [newEntryCategory, setNewEntryCategory] = useState<
    "allowlist" | "blocklist"
  >("blocklist");

  // Pagination state
  const [allowlistPage, setAllowlistPage] = useState(1);
  const [blocklistPage, setBlocklistPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchEntries();
  }, [activeTab, allowlistPage, blocklistPage, itemsPerPage]);

  const fetchEntries = async () => {
    try {
      setLoading(true);

      // Fetch allowlist entries
      const allowlistResponse = await getCustomListEntries({
        category: "allowlist",
        limit: itemsPerPage,
        offset: (allowlistPage - 1) * itemsPerPage,
      });
      if (allowlistResponse.success && allowlistResponse.data) {
        setAllowlistEntries(allowlistResponse.data.entries);
        setAllowlistCount(allowlistResponse.data.count);
      }

      // Fetch blocklist entries
      const blocklistResponse = await getCustomListEntries({
        category: "blocklist",
        limit: itemsPerPage,
        offset: (blocklistPage - 1) * itemsPerPage,
      });
      if (blocklistResponse.success && blocklistResponse.data) {
        setBlocklistEntries(blocklistResponse.data.entries);
        setBlocklistCount(blocklistResponse.data.count);
      }
    } catch (error: any) {
      console.error("Failed to fetch custom list entries:", error);
      toast.error(
        error.response?.data?.message || "Failed to load custom list entries"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    if (!newEntryValue.trim()) {
      toast.error("Please enter a value");
      return;
    }

    try {
      setIsCreating(true);
      const payload: CreateCustomListPayload = {
        value: newEntryValue.trim(),
        category: newEntryCategory,
      };

      await createCustomListEntry(payload);
      toast.success(
        `Entry added to ${
          newEntryCategory === "allowlist" ? "allowlist" : "blocklist"
        } successfully!`
      );

      // Reset form
      setNewEntryValue("");
      setNewEntryCategory("blocklist");
      setIsDialogOpen(false);

      // Refresh entries
      await fetchEntries();
    } catch (error: any) {
      console.error("Failed to create custom list entry:", error);
      toast.error(error.response?.data?.message || "Failed to create entry");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom List</h1>
          <p className="text-muted-foreground mt-1">
            Manage your allowlist and blocklist entries
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Entry</DialogTitle>
              <DialogDescription>
                Add a new entry to your custom list. The value will be
                automatically detected as email, IP, or other type.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="entry-value">Value</Label>
                <Input
                  id="entry-value"
                  placeholder="e.g., vigne@gmail.com or 192.168.1.1"
                  value={newEntryValue}
                  onChange={(e) => setNewEntryValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entry-category">Category</Label>
                <Select
                  value={newEntryCategory}
                  onValueChange={(value) =>
                    setNewEntryCategory(value as "allowlist" | "blocklist")
                  }
                >
                  <SelectTrigger id="entry-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowlist">Allowlist</SelectItem>
                    <SelectItem value="blocklist">Blocklist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewEntryValue("");
                  setNewEntryCategory("blocklist");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEntry} disabled={isCreating}>
                {isCreating ? "Adding..." : "Add Entry"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Custom List Entries</CardTitle>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setAllowlistPage(1);
                setBlocklistPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "allowlist" | "blocklist")
            }
          >
            <TabsList className="mb-4">
              <TabsTrigger
                value="blocklist"
                className="flex items-center gap-2"
              >
                <Ban className="h-4 w-4" />
                Blocklist ({blocklistCount})
              </TabsTrigger>
              <TabsTrigger
                value="allowlist"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Allowlist ({allowlistCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blocklist" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">
                    Loading entries...
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blocklistEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Ban className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                No blocklist entries yet. Add your first entry
                                to get started.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        blocklistEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono text-sm">
                              {entry.value}
                            </TableCell>
                            <TableCell className="capitalize">
                              {entry.type}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Blocklist
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatDate(entry.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination for Blocklist */}
                  {blocklistCount > 0 &&
                    (() => {
                      const blocklistTotalPages = Math.ceil(
                        blocklistCount / itemsPerPage
                      );
                      return (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                          <div className="text-sm text-muted-foreground text-center sm:text-left">
                            Showing {(blocklistPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(
                              blocklistPage * itemsPerPage,
                              blocklistCount
                            )}{" "}
                            of {blocklistCount} entries
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setBlocklistPage((prev) =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              disabled={blocklistPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from(
                                { length: Math.min(5, blocklistTotalPages) },
                                (_, i) => {
                                  let pageNum: number;
                                  if (blocklistTotalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (blocklistPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (
                                    blocklistPage >=
                                    blocklistTotalPages - 2
                                  ) {
                                    pageNum = blocklistTotalPages - 4 + i;
                                  } else {
                                    pageNum = blocklistPage - 2 + i;
                                  }
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={
                                        blocklistPage === pageNum
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setBlocklistPage(pageNum)}
                                      className="w-9"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setBlocklistPage((prev) =>
                                  Math.min(blocklistTotalPages, prev + 1)
                                )
                              }
                              disabled={blocklistPage === blocklistTotalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                </>
              )}
            </TabsContent>

            <TabsContent value="allowlist" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">
                    Loading entries...
                  </div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Value</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allowlistEntries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Shield className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                No allowlist entries yet. Add your first entry
                                to get started.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        allowlistEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono text-sm">
                              {entry.value}
                            </TableCell>
                            <TableCell className="capitalize">
                              {entry.type}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Allowlist
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatDate(entry.created_at)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination for Allowlist */}
                  {allowlistCount > 0 &&
                    (() => {
                      const allowlistTotalPages = Math.ceil(
                        allowlistCount / itemsPerPage
                      );
                      return (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                          <div className="text-sm text-muted-foreground text-center sm:text-left">
                            Showing {(allowlistPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(
                              allowlistPage * itemsPerPage,
                              allowlistCount
                            )}{" "}
                            of {allowlistCount} entries
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setAllowlistPage((prev) =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              disabled={allowlistPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from(
                                { length: Math.min(5, allowlistTotalPages) },
                                (_, i) => {
                                  let pageNum: number;
                                  if (allowlistTotalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (allowlistPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (
                                    allowlistPage >=
                                    allowlistTotalPages - 2
                                  ) {
                                    pageNum = allowlistTotalPages - 4 + i;
                                  } else {
                                    pageNum = allowlistPage - 2 + i;
                                  }
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={
                                        allowlistPage === pageNum
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => setAllowlistPage(pageNum)}
                                      className="w-9"
                                    >
                                      {pageNum}
                                    </Button>
                                  );
                                }
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setAllowlistPage((prev) =>
                                  Math.min(allowlistTotalPages, prev + 1)
                                )
                              }
                              disabled={allowlistPage === allowlistTotalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
