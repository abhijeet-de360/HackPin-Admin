import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ban, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { format } from "date-fns";
import { getAllVideo } from "@/store/videoSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import { TableSkeleton } from "@/components/TableSkeleton ";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { updateContent } from "@/store/contentSlice";

const Video = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    limit: 20,
    offset: 0
  })

  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch<AppDispatch>()
  const videoVar = useSelector((state: RootState) => state?.video);
  const loader = useSelector((state: RootState) => state?.loader);


  useEffect(() => {
    dispatch(getAllVideo(formData.limit, formData.offset))
  }, [])

  const fetchMorePosts = async () => {
    const newOffset = formData.offset + formData.limit;

    await dispatch(
      getAllVideo(
        formData.limit,
        newOffset
      )
    );

    setFormData((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formData.limit >= videoVar?.totalVideos) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (
      videoVar?.videoList?.length >= 0 &&
      videoVar?.videoList?.length >= videoVar?.totalVideos
    ) {
      setHasMore(false);
    }
  }, [videoVar?.videoList?.length, videoVar?.totalVideos]);

  const updateStatusVideo = (id, status) => {
    dispatch(updateContent({contentId: id, status: status}, 'video')).then((res) => {
      // setSheetOpen(false)
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
            <h1 className="text-2xl font-bold">Videos</h1>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="p-6">
        <InfiniteScroll
          dataLength={videoVar?.videoList?.length || 0}
          next={fetchMorePosts}
          hasMore={hasMore}
          loader={
            hasMore && (
              <div className="text-center mt-2 text-sm text-muted-foreground">
                Showing {videoVar?.videoList?.length} of {videoVar?.totalVideos} videos •
                Scroll for more
              </div>
            )
          }
          endMessage={
            (videoVar?.videoList?.length > 0 && videoVar?.videoList?.length >= videoVar?.totalVideos ? (
              <div className="text-center mt-2 text-sm text-muted-foreground ">
                Showing all {videoVar?.totalVideos} videos
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
                  <TableHead className="w-40">Anchor</TableHead>
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
                {videoVar?.status === "loading" ? (
                  <TableSkeleton rows={8} cols={12} />
                ) : videoVar?.videoList?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-4 text-sm text-zinc-500"
                    >
                      No videos found
                    </TableCell>
                  </TableRow>
                ) : (
                  videoVar?.videoList?.map((video) => (
                    <TableRow key={video?._id}>
                      <TableCell>{video?.contentId}</TableCell>
                      <TableCell>{video?.userId?.userId}</TableCell>
                      <TableCell className="capitalize">{video?.status}</TableCell>
                      <TableCell>189</TableCell>
                      <TableCell>Yes</TableCell>
                      <TableCell>1500</TableCell>
                      <TableCell>{video?.viewsCount}</TableCell>
                      <TableCell>{video?.likesCount}</TableCell>
                      <TableCell>{video?.commentsCount}</TableCell>
                      <TableCell>{video?.shareCount}</TableCell>
                      <TableCell className="text-xs text-zinc-600">
                        {video?.createdAt
                          ? format(new Date(video.createdAt), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              {video.status === "suspended" ? (
                                <CircleCheckBig className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                              {/* <Info className="w-4 h-4" /> */}
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {video.status === "suspended" ? "Confirm Activation" : "Confirm Suspension"}
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                {video.status === "suspended"
                                  ? `Are you sure you want to activate ${video?.contentId}?.`
                                  : `Are you sure you want to suspend ${video?.contentId}?`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>

                              <AlertDialogAction
                                className={
                                  video.status === "suspended"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                }
                                onClick={() =>
                                  video.status === "suspended"
                                    ? updateStatusVideo(video._id, "active")
                                    : updateStatusVideo(video._id, 'suspended')
                                }
                              >
                                {video.status === "suspended" ? "Yes, Activate" : "Yes, Suspend"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Video;
