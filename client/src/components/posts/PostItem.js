import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { deletePost, addLike, removeLike } from "../../actions/postActions";
import Spinner from "../common/Spinner";
import { getProfiles } from "../../actions/profileActions";

class PostItem extends Component {
  componentDidMount() {
    if (!this.props.profile.profiles) {
      this.props.getProfiles();
    }
  }

  findUserLike = likes => {
    const { auth } = this.props;
    if (likes.filter(like => like.user === auth.user.id).length > 0) {
      return true;
    } else {
      return false;
    }
  };

  render() {
    const { post, auth, profile, showActions } = this.props;

    let ProfileAvatar;
    if (profile.profiles === null) {
      ProfileAvatar = <Spinner />;
    } else {
      const profileHandle = profile.profiles.find(
        profile => profile.user.name === post.name
      );

      if (profileHandle != null) {
        ProfileAvatar = (
          <Link to={`/profile/${profileHandle.handle}`}>
            <img
              className="rounded-circle d-none d-md-block"
              src={post.avatar}
              alt=""
            />
          </Link>
        );
      } else {
        ProfileAvatar = (
          <img
            className="rounded-circle d-none d-md-block"
            src={post.avatar}
            alt=""
          />
        );
      }
    }

    return (
      <div className="card card-body mb-3">
        <div className="row">
          <div className="col-md-2">
            {ProfileAvatar}
            <br />
            <p className="text-center">{post.name}</p>
          </div>
          <div className="col-md-10">
            <p className="lead">{post.text}</p>
            {showActions ? (
              <span>
                <button
                  type="button"
                  className="btn btn-light mr-1"
                  onClick={() => {
                    this.props.addLike(post._id);
                  }}
                >
                  <i
                    className={classnames("fas fa-thumbs-up", {
                      "text-info": this.findUserLike(post.likes)
                    })}
                  />
                  <span className="badge badge-light">{post.likes.length}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-light mr-1"
                  onClick={() => {
                    this.props.removeLike(post._id);
                  }}
                >
                  <i className="text-secondary fas fa-thumbs-down" />
                </button>
                <Link to={`/post/${post._id}`} className="btn btn-info mr-1">
                  Comments
                </Link>
                {post.user === auth.user.id ? (
                  <button
                    onClick={() => {
                      this.props.deletePost(post._id);
                    }}
                    type="button"
                    className="btn btn-danger mr-1"
                  >
                    <i className="fas fa-times" />
                  </button>
                ) : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

PostItem.defaultProps = {
  showActions: true
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

PostItem.propTypes = {
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  getProfiles: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};

export default connect(
  mapStateToProps,
  { deletePost, addLike, removeLike, getProfiles }
)(PostItem);
