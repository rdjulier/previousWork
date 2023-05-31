import React, { useState } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { Button, IconButton, Tooltip } from "@material-ui/core";

import {
  ViewComfy as ViewComfyIcon,
  List as ListIcon,
  AddShoppingCart as AddShoppingCartIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AddCircle as AddCircle
} from "@material-ui/icons";

import onClickShowAddToCartModal from "redux/actions/playlist/PlaylistVideos/handlers/onClickShowAddToCartModal";
import onClickShowAddToCart from "redux/actions/playlist/PlaylistVideos/handlers/onClickShowAddToCart";

import { AddToListModal } from "components/shared";
import downloadAllVideosPlaylists from "../../services/downloadAllVideosPlaylists";

import {
  resetVideoListSavedState,
  createVideoList,
  getListsByVideo,
  toggleModal,
  removeVideoFromList,
  addVideoToList
} from "redux/actions/user";

import ToolbarWrapper from "./list/styles/Toolbar.style";

function Toolbar(props) {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const shopify = useSelector((state) => state.shopify);
  const user = useSelector((state) => state.user);
  const playlistInfo = useSelector((state) => state.playlists.playlistInfo);
  const { videos } = useSelector((state) => state.playlists.playlistVideos);

  const { isMobile, setViewType, viewType} = props;

  const selectedVideo = videos.filter((video) => video.isChecked);

  const onClickChangeView = (view) => setViewType(view);

  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);

  if (!playlistInfo) return null;

  let selectText = "Add to Cart";
  let playlistText = "Add to Playlist"

  const shopifyHasNoError =
    process.env.REACT_APP_SHOPIFY_SHUTDOWN &&
    process.env.REACT_APP_SHOPIFY_SHUTDOWN !== "true" &&
    shopify.products.length > 0 &&
    !shopify.errors;

  const isRMuser = auth.loggedIn && auth.user.roles.includes("ROLE_RIFF_USER");
  const visibleOnRMWithCanModify = (isRMuser && playlistInfo.canModify) || !isRMuser;
  const showAddToCart =
    playlistInfo.canModify && shopifyHasNoError && visibleOnRMWithCanModify;
  if (isRMuser) {
    let cartItemList = user.cartItems.filter((cart) => cart.playlistUUID === playlistInfo.uuid);
    if (playlistInfo.checkoutId) {
      selectText = `View RM Cart`;
    } else if (cartItemList.length > 0) {
      selectText = "Update Cart";
    }
  }

  const onClickShowAddToCartDialog = () => {
    dispatch(onClickShowAddToCart(true));
    dispatch(onClickShowAddToCartModal(Boolean(selectedVideo)));
  };

  const onClickShowAddToPlaylistDialog = () => {
    setShowAddToPlaylistModal(true);
    dispatch(toggleModal(1, "", true));
  };

  const RenderChangeViewChip = () => (
    <div className="view__type--wrapper">
      {((viewType === "list" && isMobile) || !isMobile) && (
        <Tooltip title="Grid View" placement="left" arrow>
          <IconButton
            className={classnames("view--type", { active: viewType === "grid" })}
            onClick={() => onClickChangeView("grid")}
          >
            <ViewComfyIcon />
          </IconButton>
        </Tooltip>
      )}
      {((viewType === "grid" && isMobile) || !isMobile) && (
        <Tooltip title="List View" placement="left" arrow>
          <IconButton
            className={classnames("view--type", { active: viewType === "list" })}
            onClick={() => onClickChangeView("list")}
          >
            <ListIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );

  const RenderAddToCart = () => (
    <>
      <Button
        className={classnames("cta__addToCart", {
          active: selectedVideo.length > 0 || selectText === "Update Cart"
        })}
        startIcon={<AddShoppingCartIcon />}
        disabled={selectedVideo.length === 0 && selectText !== "Update Cart"}
        onClick={onClickShowAddToCartDialog}
      >
        {selectText}
      </Button>
      <Button
      style={{ marginLeft: '10px' }}
      className={classnames("cta__addToCart", {
        active: selectedVideo.length > 0
      })}
      startIcon={<AddCircle />}
      disabled={selectedVideo.length === 0}
      onClick={onClickShowAddToPlaylistDialog}
    >
        {playlistText}
      </Button>
    </>
  );

  if (playlistInfo.checkoutId && isRMuser) {
    if (shopify.session) {
      selectText = "View RM Cart";
    }

    return (
      <ToolbarWrapper>
        {isMobile && (
          <Link to={`/licensing/checkout/${playlistInfo.uuid}`}>
            <Button startIcon={<AddShoppingCartIcon />} className="cta__addToCart active">
              {selectText}
            </Button>
          </Link>
        )}
        <div className="toolbar--cta--wrapper">
          {!isMobile && (
            <Link to={`/licensing/checkout/${playlistInfo.uuid}`}>
              <Button startIcon={<AddShoppingCartIcon />} className="cta__addToCart active">
                {selectText}
              </Button>
            </Link>
          )}
          <RenderChangeViewChip />
        </div>
      </ToolbarWrapper>
    );
  }

  return (
    <ToolbarWrapper>
      {showAddToCart && isMobile && <RenderAddToCart />}
      <div className="toolbar--cta--wrapper">
        {showAddToCart && !isMobile && <RenderAddToCart />}
        {isMobile && viewType === "list" && (
          <Button
            className="cta--sort"
            endIcon={props.order === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            onClick={(e) => props.handleRequestSort(e, "title")}
          >
            Name
          </Button>
        )}
        {isMobile && viewType === "grid" && (
          <Button
            className="cta--sort"
            endIcon={
              props.playlistVideosSort.order === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
            }
            onClick={() =>
              props.onChangeSort(
                "order",
                props.playlistVideosSort.order === "asc" ? "desc" : "asc",
                true
              )
            }
          >
            Name
          </Button>
        )}
        {showAddToPlaylistModal && <AddToListModal
          auth={auth}
          user={user}
          resetVideoListSavedState={resetVideoListSavedState}
          createVideoList={createVideoList}
          getListsByVideo={getListsByVideo}
          toggleModal={toggleModal}
          removeVideoFromList={removeVideoFromList}
          addVideoToList={addVideoToList}
          downloadAllVideosPlaylists={downloadAllVideosPlaylists}
          onClose={() => setShowAddToPlaylistModal(false)}
        />}
        <RenderChangeViewChip />
      </div>
    </ToolbarWrapper>
  );
}

Toolbar.propTypes = {
  viewType: PropTypes.string
};

Toolbar.defaultProps = {
  viewType: "grid"
};

export default Toolbar;
