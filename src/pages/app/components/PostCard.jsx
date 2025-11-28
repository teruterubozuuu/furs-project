import React from "react";
import { Link } from "react-router-dom";
import useGeocoding from "./useGeocoding";

export default function Card({
  post,
  user,
  currentUserProfile,
  handleLike,
  handleDeletePost,
  handleEditPost,
  openMenuId,
  setOpenMenuId,
  handleCopyLink,
}) {
  const address = useGeocoding(post.location);

  const isOwner = user?.uid === post.userId;
  const profilePath = isOwner ? "/profile" : `/profile/${post.userId}`;

  return (
    <div
      key={post.id}
      className="mb-3 bg-[#fafafa] border border-gray-200 hover:bg-[#f1f1f1] transition-all ease-in shadow-sm p-5 rounded-lg text-sm cursor-pointer"
    >
      {/* Post header */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-start pb-2">
          <div className="flex h-full items-center ">
            <Link to={profilePath}>
              <img
                src={
                  isOwner
                    ? user?.photoURL || currentUserProfile.photoURL
                    : post.userPhoto || defaultImg
                }
                alt="Profile"
                className="w-17 h-17 rounded-full object-cover"
              />
            </Link>

            <div className="pl-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={profilePath}
                  className="text-base font-semibold hover:underline cursor-pointer"
                >
                  {isOwner ? currentUserProfile.username : post.username}
                </Link>
                <p className="text-[11px] text-gray-600">
                  {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "Just now"}
                </p>
              </div>
              <div className="md:flex md:flex-row flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] p-1 border rounded-sm ${
                      post.status === "Stray Animal"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : post.status === "Lost Pet"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    {post.status}
                  </span>

                  {post.animalType && (
                    <span
                      className={`text-[10px] flex items-center p-1 border rounded-sm ${
                        post.animalType === "Dog"
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : post.animalType === "Cat"
                          ? "bg-orange-100 text-orange-700 border-orange-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}
                    >
                      {post.animalType}
                    </span>
                  )}
                </div>
                {/* Dog characteristics */}
                <div className="flex py-1 gap-1">
                  {post.breed && (
                    <span className="text-[10px] flex items-center  p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                      {post.breed}
                    </span>
                  )}

                  <span className="text-[10px] flex items-center  p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                    {post.coatColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit/Delete Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative flex flex-col items-end">
              {/* Post Menu */}
              <div className="relative flex flex-col items-end">
                {/* Post Menu Button */}
                <i
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === post.id ? null : post.id);
                  }}
                  className="cursor-pointer bi bi-three-dots text-gray-500 hover:text-gray-700 font-medium transition duration-150 ease-in-out text-lg flex justify-end"
                ></i>

                {/* Dropdown Menu */}
                {openMenuId === post.id && (
                  <div className="flex flex-col items-start border border-gray-200 bg-white w-[80px] rounded-md absolute top-5 right-0 z-10 shadow-sm">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyLink(post.id);
                      }}
                      className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 py-2"
                    >
                      Copy Link
                    </button>
                    {isOwner && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditPost(post);
                            setOpenMenuId(null);
                          }}
                          className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePost(post.id, post.type);
                            setOpenMenuId(null);
                          }}
                          className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link to={`/${post.username}/status/${post.id}`}>
          {/* Description */}
          <p>{post.description}</p>
          {/* Photo */}
          <div className="flex justify-center p-3">
            <img
              src={post.photoURL}
              alt="Posted"
              className="w-100 rounded-sm"
            />
          </div>

          {/* Location */}
          {post.location?.landmark && (
            <p className="mt-1 italic text-gray-500">
              <span className="font-semibold text-gray-500">Landmark:</span>{" "}
              {post.location.landmark}
            </p>
          )}
          <div className="py-1 text-sm text-gray-500">
            {post.location ? (
              <p className="italic">
                {" "}
                <span className="font-semibold">Address:</span> {address}
              </p>
            ) : (
              <p className="italic">Location not available</p>
            )}
          </div>
        </Link>
      </div>
      {/* Post actions */}
      <Link to={`/${post.username}/status/${post.id}`}>
        <div className="flex flex-1 justify-between xl:justify-around px-2 pt-3 text-md text-gray-500 font-medium">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLike(post.id, post.type);
            }}
            className="group cursor-pointer flex items-center gap-1"
          >
            <i
              className={`bi ${
                post.isLikedByUser
                  ? "bi-hand-thumbs-up-fill text-[#fbc02d]"
                  : "bi-hand-thumbs-up text-gray-500 group-hover:text-[#fbc02d] transition-all ease-in"
              }`}
            ></i>
            <span
              className={`ml-2 font-medium  ${
                post.isLikedByUser
                  ? "text-[#fbc02d]"
                  : "text-gray-500 group-hover:text-[#fbc02d] transition-all ease-in"
              }`}
            >
              {post.likes > 0 ? post.likes : "Like"}
            </span>
          </button>

          <div className="flex items-center gap-2 hover:text-[#fbc02d]">
            <i className="bi bi-chat"></i>
            <span>Comment</span>
          </div>
          {isOwner ? (
            ""
          ) : (
            <>
              <div className="flex items-center gap-2 hover:text-[#fbc02d]">
                <i className="bi bi-star-half"></i>
                <span>Rate</span>
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
