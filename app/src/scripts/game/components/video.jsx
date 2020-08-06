/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import YouTube from 'react-youtube';
import { stageTypes, getActiveQuestData } from '../../_utils';
import { } from '../../../actions/index';


class Video extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ytPlayer: null,
      ytStatus: null,
      loading: null,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.loading === true) {
      this.setState({
        ytStatus: null,
        loading: null,
      });
    }
  }

  goToNextStageWithLoader() {
    this.setState({
      loading: true,
    });
    this.props.goToNextStage(this.props.activeStageData);
  }

  renderFeatured() {
    if (this.props.activeStageData.featuredChannel) {
      return <div className="featuredYoutubeChannel">
        <img className="channelIcon" src={this.props.activeStageData.featuredChannel.icon} />
        <div className="channelName">{this.props.activeStageData.featuredChannel.name}</div>
        <a className="btn btn-primary youtubeButton" href={`https://www.youtube.com/channel/${this.props.activeStageData.featuredChannel.youtubeChannelId}`} target="_blank"></a>
      </div>
    }
  }

  _onYoutubeReady(event) {
    // Set access to player via the state from the event handlers, event.target
    // console.log('Video initiated', event, event.data);
    this.setState({
      ytPlayer: event.target,
    });
  }

  _onYoutubeStateChanged(event) {
    // Storing the current video state from the event.data
    // Status values: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued).
    // console.log('Video status changed!', event, event.data);
    this.setState({
      ytStatus: event.data,
    });
  }

  isVideoPlaying() {
    return (this.state.ytStatus === 3 || this.state.ytStatus === 1);
  }

  isVideoReadyToPlay() {
    return (this.state.ytStatus === null || this.state.ytStatus === 5);
  }

  playVideo() {
    if (this.state.ytPlayer) {
      this.state.ytPlayer.playVideo();
    }
    else {
      console.error('Youtube player not ready yet!');
    }
  }

  renderVideo() {
    if (this.props.activeStageData.youtubeVideoId) {
      return <YouTube 
        videoId={this.props.activeStageData.youtubeVideoId}
        opts={ {
          height: (this.props.viewOnly) ? '340' : '100%',
          width: (this.props.viewOnly) ? '570' : '100%',
          playerVars: {
            // https://developers.google.com/youtube/player_parameters
            // autoplay: 1,
            rel: 0,
          }
        } }
        onReady={(event) => { this._onYoutubeReady(event) } }
        onStateChange={(event) => { this._onYoutubeStateChanged(event) } }
      />;
      // return <iframe 
      //   className="youtubeVideo"
      //   src={`https://www.youtube.com/embed/${this.props.activeStageData.youtubeVideoId}`}
      //   frameBorder="0"
      //   allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      //   allowFullScreen />
    }
    else {
      console.error('No youtubeId to show video.');
    }
  }

  viewOrderIsDefined() {
    return (this.props.embeddedPage && this.props.embeddedPage.viewOrderId !== null && this.props.embeddedPage.viewOrderId !== undefined);
  }

  renderViewOnly() {
    if (this.props.viewOnly) {
      return <div className="col-12">
        <p><strong>Youtube video link:</strong> <a href={`https://www.youtube.com/watch?v=${this.props.activeStageData.youtubeVideoId}`} target="_blank">{`https://www.youtube.com/watch?v=${this.props.activeStageData.youtubeVideoId}`}</a></p>
      </div>
    }
  }

  renderOverlay() {
    if (!this.props.viewOnly && !this.isVideoPlaying()) {
      let playButton = <div 
        className={`btn ${(this.isVideoReadyToPlay()) ? 'btn-primary' : 'btn-secondary' } btn-lg ${ (!this.state.ytPlayer) ? 'loader' : ''}`}
        onClick={() => { this.playVideo() }}
        >
        ▶ {(this.isVideoReadyToPlay()) ? 'PLAY' : 'CONTINUE' } VIDEO
      </div>;
      let nextButton = <div
        className={`btn btn-primary btn-lg ${ (this.state.loading) ? 'loader' : ''}`}
        onClick={() => { this.goToNextStageWithLoader() } }
        >
        { (!this.state.loading) ? 'NEXT STEP' : ''}
      </div>;
      if (this.state.ytStatus !== 0) {
        return <div className={'overlay-content' }>
          <h2>{this.props.activeStageData.name}</h2>
          <h5>{this.props.activeStageData.subtitle}</h5>
          <div className="videosBtns">
            { playButton }
            { (!this.isVideoReadyToPlay()) ? nextButton : '' }
          </div>
        </div>;
      }
      else {
        return <div className="overlay-content">
          <h5 className="text-center">Good job in watching this whole video. Let's see what's next! 👀</h5>

          <div className="videosBtns">
            { nextButton }
          </div>
        </div>
      }
    }
  }

  render() {
    if (this.props.activeStageData) {
      return <div className={`videoWrapper ${ (!this.props.viewOnly) ? 'wideVideo' : '' }`}>
        { this.renderOverlay() }
        { this.renderVideo() }
        {/* { this.renderFeatured() } */}
        { this.renderViewOnly() }
      </div>
    }
    else {
      return <div>Loading</div>
    }
  }
}

const mapStateToProps = (state) => {
  return {
    embeddedPage: state.embeddedPage,
    activeQuest: state.activeQuest,
    activeQuestData: getActiveQuestData(state),
  };
};

function mapDispatchToProps(dispatch) {
return bindActionCreators({ }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Video);
