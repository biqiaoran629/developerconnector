import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { deleteComment } from "../../actions/postActions";
import { getProfiles } from "../../actions/profileActions";
import Spinner from "../common/Spinner";
import { Link } from "react-router-dom";

class CommentItem extends Component {
  componentDidMount() {
    if (!this.props.profile.profiles) {
      this.props.getProfiles();
    }
  }

  onDeleteClick = (postId, commentId) => {
    this.props.deleteComment(postId, commentId);
  };

  render() {
    const { comment, postId, profile, auth } = this.props;

    let ProfileAvatar;
    if (profile.profiles === null) {
      ProfileAvatar = <Spinner />;
    } else {
      const profileHandle = profile.profiles.find(
        profile => profile.user.name === comment.name
      );

      if (profileHandle != null) {
        ProfileAvatar = (
          <Link to={`/profile/${profileHandle.handle}`}>
            <img
              className="rounded-circle d-none d-md-block"
              src={comment.avatar}
              alt=""
            />
          </Link>
        );
      } else {
        ProfileAvatar = (
          <img
            className="rounded-circle d-none d-md-block"
            src={comment.avatar}
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
            <p className="text-center">{comment.name}</p>
          </div>
          <div className="col-md-10">
            <p className="lead">{comment.text}</p>
            {comment.user === auth.user.id ? (
              <button
                onClick={() => this.onDeleteClick(postId, comment._id)}
                type="button"
                className="btn btn-danger mr-1"
              >
                <i className="fas fa-times" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

CommentItem.propTypes = {
  deleteComment: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  postId: PropTypes.string.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  profile: state.profile
});

export default connect(
  mapStateToProps,
  { deleteComment, getProfiles }
)(CommentItem);
