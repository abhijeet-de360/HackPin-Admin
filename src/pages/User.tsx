import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RotateCcw, Info, Check, X, CircleCheckBig, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserMenu } from "@/components/auth/UserMenu";
import hackpin_logo from "/hackpinpng.png";
import { Country, State, City } from "country-state-city";
import { changeStatus, getUserList } from "@/store/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, } from "@/components/ui/alert-dialog";
import InfiniteScroll from "react-infinite-scroll-component";
import { Badge } from "@/components/ui/badge";

type FormDataType = {
  limit: number;
  offset: number;
  keyword: string;
  status: string;
  country: string;
  state: string;
  city: string;
};

export default function User() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const userVar = useSelector((state: RootState) => state.user);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    limit: 20,
    offset: 0,
    keyword: "",
    status: "",
    country: "",
    state: "",
    city: "",
  });

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCountries(Country.getAllCountries());
    dispatch(
      getUserList(
        formData.limit,
        0,
        formData.keyword,
        formData.status,
        formData.country,
        formData.state,
        formData.city
      )
    );
  }, []);

  const fetchMoreUsers = async () => {
    const newOffset = formData.offset + formData.limit;

    await dispatch(
      getUserList(
        formData.limit,
        newOffset,
        formData.keyword,
        formData.status,
        formData.country,
        formData.state,
        formData.city
      )
    );

    setFormData((prev) => ({
      ...prev,
      offset: newOffset,
    }));

    if (newOffset + formData.limit >= userVar.totalUser) {
      setHasMore(false);
    }
  };


  const handleSearch = (value: string) => {
    setFormData({ ...formData, keyword: value, offset: 0 });
    setHasMore(true);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(() => {
      dispatch(
        getUserList(
          formData.limit,
          0,
          value,
          formData.status,
          formData.country,
          formData.state,
          formData.city
        )
      );
    }, 700);
  };

  // FILTERS (unchanged, only hasMore reset added)
  const handleCountryChange = (value: string) => {
    setFormData({ ...formData, country: value, offset: 0 });
    setHasMore(true);
    setStates(State.getStatesOfCountry(value));

    dispatch(getUserList(formData.limit, 0, formData.keyword, formData.status, value, "", ""));
  };

  const handleStateChange = (value: string) => {
    setFormData({ ...formData, state: value, offset: 0 });
    setHasMore(true);
    setCities(City.getCitiesOfState(formData.country, value));

    dispatch(getUserList(formData.limit, 0, formData.keyword, formData.status, formData.country, value, ""));
  };

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, city: value, offset: 0 });
    setHasMore(true);

    dispatch(getUserList(formData.limit, 0, formData.keyword, formData.status, formData.country, formData.state, value));
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value === 'all' ? "" : value, offset: 0 });
    setHasMore(true);

    dispatch(getUserList(formData.limit, 0, formData.keyword, value === 'all' ? "" : value, formData.country, formData.state, formData.city));
  };

  const handleReset = () => {
    setFormData({
      limit: formData.limit,
      offset: 0,
      keyword: "",
      status: "",
      country: "",
      state: "",
      city: "",
    });
    setHasMore(true);

    dispatch(getUserList(formData.limit, 0, "", "", "", "", ""));
  };

  const getStatusBadge = (status: string) => (
    <Badge variant="outline" className={status === "active" ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <img className="w-28" src={hackpin_logo} />
          <UserMenu />
        </div>
      </header>

      <div className="p-6 max-w-[1800px] mx-auto">
        {/* FILTERS */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={formData.keyword}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={formData.country} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={formData.state} onValueChange={handleStateChange}>
            <SelectTrigger className="w-[140px]" disabled={!formData.country}>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={formData.city} onValueChange={handleCityChange}>
            <SelectTrigger className="w-[140px]" disabled={!formData.state}>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {userVar.totalUser === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">
            No User found
          </div>
        ) : (
          <InfiniteScroll
            dataLength={userVar.userList.length}
            next={fetchMoreUsers}
            hasMore={hasMore}
            loader={<h4 />}
            endMessage={
              <p className="text-center py-4 text-muted-foreground">
                Showing all {userVar.totalUser} users
              </p>
            }
          >
            <div className="border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        User Id
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Email & Mobile No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        State
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Video
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Reels
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Challenges
                      </th>


                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {userVar?.userList?.map((user) => (
                      <tr key={user._id} className="hover:bg-muted/30">

                        <td
                          className="px-4 py-3 text-sm font-medium cursor-pointer text-primary hover:underline"
                          onClick={() => navigate(`/user/${user?._id}`)}
                        >
                          {user?.userId}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {!user?.isSubscribed ? 'Regular' : "Pro"}
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(user?.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground flex-col flex">
                          {user?.email}
                          <small>{user.phoneNumber}</small>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {user?.country}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {user?.state}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                          {user?.city}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                          {user?.totalPost}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                          {user?.totalVideo}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground text-center">
                          {user?.totalReels}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">{user?.totalChallenges}</td>


                        <td className="px-4 py-3 text-left">
                          {getStatusBadge(user?.status)}
                        </td>

                        <td className="px-4 py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                {user.status === "suspended" ? (
                                  <CircleCheckBig className="w-4 h-4" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {user.status === "suspended" ? "Confirm Activation" : "Confirm Suspension"}
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  {user.status === "suspended"
                                    ? `Are you sure you want to activate ${user?.name}? They will regain access to the system.`
                                    : `Are you sure you want to suspend ${user?.name}?`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>

                                <AlertDialogAction
                                  className={
                                    user.status === "suspended"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-red-600 hover:bg-red-700"
                                  }
                                  onClick={() =>
                                    user.status === "suspended"
                                      ? dispatch(changeStatus(user._id, "active"))
                                      : dispatch(changeStatus(user._id, "suspended"))
                                  }
                                >
                                  {user.status === "suspended" ? "Yes, Activate" : "Yes, Suspend"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
