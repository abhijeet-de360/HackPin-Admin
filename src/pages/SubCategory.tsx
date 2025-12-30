import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Plus, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/auth/UserMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addSubCategory, getSubCategoryList, statusUpdate, updateSubCategory } from "@/store/subCategorySlice";
import { AddSubCategoryDialog } from "@/components/category/AddSubCategoryDialog"; import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TableSkeleton } from "@/components/TableSkeleton ";

const SubCategory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("id");
  const type = searchParams.get("type");
  const subCategoryVar = useSelector((state: RootState) => state.subCategory)
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);


  const [formData, setformData] = useState({
    limit: 20,
    offset: 0,
    keyword: ''
  })



  useEffect(() => {
    if (categoryId) {
      dispatch(getSubCategoryList(categoryId, formData.limit, formData.offset, formData.keyword));
    }
  }, [dispatch, categoryId])

  const handleAdd = () => {
    setEditItem(null);
    setAddDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setAddDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editItem) {
      dispatch(updateSubCategory(editItem?._id, {
        name: data.name,
        priority: data.priority
      }))
    } else {
      dispatch(addSubCategory({
        categoryId: categoryId,
        priority: data.priority,
        name: data.name,
      })).then((res) => {
        setAddDialogOpen(false);
      })
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{type}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${type}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button
              size="icon"
              onClick={() => handleAdd()}
              className="bg-black text-white hover:bg-black/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">ID</TableHead>
                <TableHead className="w-48">Name</TableHead>
                <TableHead className="w-48">Priority</TableHead>
                <TableHead className="w-40">Posts</TableHead>
                <TableHead className="w-40">Challenge</TableHead>
                <TableHead className="w-40">Reels</TableHead>
                <TableHead className="w-40">Video</TableHead>
                <TableHead className="w-40 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subCategoryVar?.status === "loading" ? (
                <TableSkeleton rows={6} cols={8} />
              ) : subCategoryVar.subSubCategoryList?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-4 text-sm text-zinc-500"
                  >
                    {`No ${type} found`}
                  </TableCell>
                </TableRow>
              ) : (
                subCategoryVar.subSubCategoryList.map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.subCategoryId}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.priority}</TableCell>
                      <TableCell>{item.totalPosts}</TableCell>
                      <TableCell>{item.totalChallenges}</TableCell>
                      <TableCell>{item.totalReels}</TableCell>
                      <TableCell>{item.totalVideos}</TableCell>
                      <TableCell className="flex items-center gap-1 justify-end">
                        <div>
                          <Button size='icon' variant='ghost' onClick={() => handleEdit(item)}>
                            <Edit className='w-4 h-4 cursor-pointer' />
                          </Button>
                        </div>
                        <div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" className="bg-red-50 hover:bg-red-50">
                                <Trash className="w-4 h-4 cursor-pointer text-red-600" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Sub Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this sub category?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                    dispatch(statusUpdate(item._id, 'deleted'))
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddSubCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        mode={editItem ? "edit" : "add"}
        initialData={editItem}
        onSubmit={handleSubmit}
        isEdit={editItem ? true : false}
      />
    </div>
  );
};

export default SubCategory;
