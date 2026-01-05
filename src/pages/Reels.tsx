import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, Plus, CircleCheckBig, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getAllReel } from "@/store/reelSlice";
import { format } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";
import { TableSkeleton } from "@/components/TableSkeleton ";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { updateContent } from "@/store/contentSlice";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ReelPlayer from "@/components/ReelPlayer";

const Reels = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    limit: 20,
    offset: 0
  })
  const [sheetOpen, setSheetOpen] = useState(false);
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(null);

  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch<AppDispatch>()
  const reelVar = useSelector((state: RootState) => state?.reel);

  useEffect(() => {
    dispatch(getAllReel(formData.limit, formData.offset))
  }, [])

  const fetchMorePosts = async () => {
    const newOffset = formData.offset + formData.limit;

    await dispatch(
      getAllReel(
        formData.limit,
        newOffset
      )
    );

    setFormData((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formData.limit >= reelVar?.totalList) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (
      reelVar?.reelList.length > 0 &&
      reelVar?.reelList.length >= reelVar?.totalList
    ) {
      setHasMore(false);
    }
  }, [reelVar?.reelList?.length, reelVar?.totalList]);

  const updateStatusReel = (id, status) => {
    dispatch(updateContent({contentId: id, status: status}, 'reel')).then((res) => {
      setSheetOpen(false)
    })
  }



  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Reels</h1>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="p-6">
        <InfiniteScroll
          dataLength={reelVar?.reelList?.length || 0}
          next={fetchMorePosts}
          hasMore={hasMore}
          loader={
            hasMore && (
              <div className="text-center mt-2 text-sm text-muted-foreground">
                Showing {reelVar?.reelList?.length} of {reelVar?.totalList} reels •
                Scroll for more
              </div>
            )
          }
          endMessage={
            (reelVar?.reelList?.length > 0 && reelVar?.reelList?.length >= reelVar?.totalList ? (
              <div className="text-center mt-2 text-sm text-muted-foreground ">
                Showing all {reelVar?.totalList} reels
              </div>
            ) : null)
          }
        >
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Reel Id</TableHead>
                  <TableHead className="w-48">User Id</TableHead>
                  <TableHead className="w-48">Status</TableHead>
                  <TableHead className="w-48">Challenge</TableHead>
                  <TableHead className="w-40">CTA</TableHead>
                  <TableHead className="w-40">Impression</TableHead>
                  <TableHead className="w-40">Views</TableHead>
                  <TableHead className="w-24">Like</TableHead>
                  <TableHead className="w-32">Comment</TableHead>
                  <TableHead className="w-32">Share</TableHead>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead className="w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reelVar?.status === "loading" ? (
                  <TableSkeleton rows={8} cols={12} />
                ) : reelVar?.reelList?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-4 text-sm text-zinc-500"
                    >
                      No videos found
                    </TableCell>
                  </TableRow>
                ) : (
                  reelVar?.reelList?.map((reel) => {
                    return (
                      <TableRow key={reel?._id}>
                        <TableCell className="cursor-pointer" onClick={() => {
                          setContent(reel);
                          setSheetOpen(true);
                        }}>
                          {reel?.contentId}
                        </TableCell>

                        <TableCell>{reel?.userId?.userId}</TableCell>
                        <TableCell className="capitalize">
                          <Badge variant="outline" className={`text-xs ${reel?.status === "active"
                            ? "text-green-600"
                            : reel?.status === "draft"
                              ? "text-yellow-600"
                              : "text-red-600"
                            }`}>{reel?.status}</Badge>
                        </TableCell>
                        <TableCell>189</TableCell>
                        <TableCell>Yes</TableCell>
                        <TableCell>1500</TableCell>
                        <TableCell>{reel?.viewsCount}</TableCell>
                        <TableCell>{reel?.likesCount}</TableCell>
                        <TableCell>{reel?.commentsCount}</TableCell>
                        <TableCell>{reel?.shareCount}</TableCell>
                        <TableCell className="text-xs text-zinc-600">
                          {reel?.createdAt ? format(new Date(reel.createdAt), "dd/MM/yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                {reel.status === "suspended" ? (
                                  <CircleCheckBig className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {reel.status === "suspended" ? "Confirm Activation" : "Confirm Suspension"}
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  {reel.status === "suspended"
                                    ? `Are you sure you want to activate ${reel?.contentId}?.`
                                    : `Are you sure you want to suspend ${reel?.contentId}?`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction
                                  className={
                                    reel.status === "suspended"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-red-600 hover:bg-red-700"
                                  }
                                  onClick={() =>
                                    reel.status === "suspended"
                                      ? updateStatusReel(reel._id, "active")
                                      : updateStatusReel(reel._id, 'suspended')
                                  }
                                >
                                  {reel.status === "suspended" ? "Yes, Activate" : "Yes, Suspend"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </InfiniteScroll>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{''}</SheetTitle>
            <SheetDescription>{''}</SheetDescription>
          </SheetHeader>
          <div className="w-full mt-4">
            <ReelPlayer video={content?.video?.url} thumbnail={content?.thumbnail?.url}/> 
            <div className="buttons w-full flex items-center gap-4 px-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setSheetOpen(false)}>Cancel</Button>
              {
                content?.status === "active" ? (
                  <Button className="flex-1" variant="destructive" onClick={() => updateStatusReel(content?._id, 'suspended')}>Suspend</Button>
                ) : (
                  <Button className="flex-1 bg-green-600 hover:bg-green-500" onClick={() => updateStatusReel(content?._id, 'active')}>Activate</Button>
                )
              }
              {/* <Button variant="destructive" className="flex-1" onClick={() => updateStatusReel(content?._id, 'suspended')}>Suspend</Button> */}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Reels;
