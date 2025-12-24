import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { getAllPost } from "@/store/postSlice";
import { format } from "date-fns";
import InfiniteScroll from "react-infinite-scroll-component";
import { TableSkeleton } from "@/components/TableSkeleton ";




const Post = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const postVar = useSelector((state: RootState) => state.post);
  const loader = useSelector((state: RootState) => state.loader)

  const [hasMore, setHasMore] = useState(true);
  const [formData, setFormData] = useState({
    limit: 20,
    offset: 0
  })


  useEffect(() => {
    dispatch(getAllPost(formData?.limit, formData?.offset))
  }, [])

  const fetchMorePosts = async () => {
    const newOffset = formData.offset + formData.limit;

    await dispatch(
      getAllPost(
        formData.limit,
        newOffset
      )
    );

    setFormData((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formData.limit >= postVar?.totalList) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (
      postVar?.postList?.length > 0 &&
      postVar?.postList?.length >= postVar?.totalList
    ) {
      setHasMore(false);
    }
  }, [postVar?.postList?.length, postVar?.totalList]);



  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Posts</h1>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>


      <div className="p-6">
        <InfiniteScroll
          dataLength={postVar?.postList?.length || 0}
          next={fetchMorePosts}
          hasMore={hasMore}
          loader={
            hasMore && (
              <div className="text-center mt-2 text-sm text-muted-foreground">
                Showing {postVar?.postList.length} of {postVar?.totalList} posts •
                Scroll for more
              </div>
            )
          }
          endMessage={
            (postVar?.postList.length > 0 && postVar?.postList.length >= postVar?.totalList ? (
              <div className="text-center mt-2 text-sm text-muted-foreground ">
                Showing all {postVar?.totalList} posts
              </div>
            ) : null)
          }
        >
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Post Id</TableHead>
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
                </TableRow>
              </TableHeader>

              <TableBody>
                {postVar?.status === "loading" ? (
                  <TableSkeleton rows={8} cols={11} />
                ) : postVar?.postList?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-4 text-sm text-zinc-500"
                    >
                      No Posts found
                    </TableCell>
                  </TableRow>
                ) : (
                  postVar?.postList?.map((post) => (
                    <TableRow key={post?._id}>
                      <TableCell>{post?.contentId}</TableCell>
                      <TableCell>{post?.userId?.userId}</TableCell>
                      <TableCell className="capitalize">{post?.status}</TableCell>
                      <TableCell>189</TableCell>
                      <TableCell>Yes</TableCell>
                      <TableCell>1500</TableCell>
                      <TableCell>{post?.viewsCount}</TableCell>
                      <TableCell>{post?.likesCount}</TableCell>
                      <TableCell>{post?.commentsCount}</TableCell>
                      <TableCell>{post?.shareCount}</TableCell>
                      <TableCell className="text-xs text-zinc-600">
                        {post?.createdAt
                          ? format(new Date(post.createdAt), "dd/MM/yyyy")
                          : "-"}
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

export default Post;
