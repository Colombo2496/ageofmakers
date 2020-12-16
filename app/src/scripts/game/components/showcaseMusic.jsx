/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import { setActivePlayerSDG, changeQuestProgress, startQuest } from '../../../actions/index';
import { getActiveQuestData, getActivePlayerData, stageStatus } from '../../_utils';
import Quiz from './quiz';
import Markdown from './markdown';

class MusicShowcase extends Component {
  constructor(props) {
      super(props);

      this.state = {
        quizToShow: {},
        showcaseItemLoading: {},
        loading: null,
      }
  }

  startShowcaseBt(showcaseItem) {
    this.toggleShowcaseItemLoading(showcaseItem, true);
    this.props.startQuest(this.props.activeQuest.quest, this.props.currentTab.id, showcaseItem.order);
    window.location = showcaseItem.startUrl;
  }

  isQuizOpen(showcaseItem) {
    return this.state.quizToShow[showcaseItem.order];
  }

  toggleQuizView(showcaseItem, show) {
    let newQuizToShow = this.state.quizToShow;
    newQuizToShow[showcaseItem.order] = show;
    this.setState({
      quizToShow: newQuizToShow,
    });
  }

  isShowcaseItemLoading(showcaseItem) {
    return this.state.showcaseItemLoading[showcaseItem.order];
  }

  toggleShowcaseItemLoading(showcaseItem, loading) {
    let newShowcaseItemLoading = this.state.showcaseItemLoading;
    newShowcaseItemLoading[showcaseItem.order] = loading;
    this.setState({
      showcaseItemLoading: newShowcaseItemLoading,
    });
  }

  renderActionBtn(showcaseItem) {
    if (!this.props.viewOnly) {
      if (showcaseItem.status === stageStatus.STATUS_COMPLETE) {
        let quizDiv;

        if (this.isQuizOpen(showcaseItem)) {
          quizDiv = <div className="quiz-results">
            <div className="collapse" onClick={() => { this.toggleQuizView(showcaseItem, false) }}>Hide Quiz Results</div>
            <Quiz 
              quizData={this.props.activeStageData.quiz}
              quizResults={showcaseItem.results}
              inline={true}
              editable={true} 
              saveQuiz={(questions) => {
                this.props.changeQuestProgress(this.props.activeQuest.quest, this.props.activeStageData.order, showcaseItem.order, questions); 
              } }/>
          </div>
        }
        else {
          quizDiv = <div className="quiz-results">
            <div className="expand" onClick={() => { this.toggleQuizView(showcaseItem, true) }}>Show Quiz Results</div>
          </div>
        }

        return <div>
          { quizDiv }
          <button className={ `btn btn-success ${ (this.isShowcaseItemLoading(showcaseItem)) ? 'loader' : '' }` } onClick={ () => { this.startShowcaseBt(showcaseItem); } }>▶ Review the story</button>
        </div>
      }
      else {
        return <button className={ `btn btn-dark btn-action ${ (this.isShowcaseItemLoading(showcaseItem)) ? 'loader' : '' }` } onClick={ () => { this.startShowcaseBt(showcaseItem); } }>{ (!this.isShowcaseItemLoading(showcaseItem)) ? 'Listen to the story' : '' }</button>
      }
    }
    else {
      return <div>
        <a href={ showcaseItem.startUrl } target="_blank" className="btn btn-primary btn-action">Listen to the story</a>
        <p><strong>Story's Full Url:</strong> { showcaseItem.startUrl }</p>
      </div>
    }
  }

  renderShowcaseItems() {
    if (this.props.activeStageData.showcaseItems) {
      return this.props.activeStageData.showcaseItems.map((song) => {
        let imgParsedUrl;
        if (song.imageUrl) {
          try {
            imgParsedUrl = new URL(song.imageUrl);
          }
          catch(err) {
            console.error('Error while parsing url', song.imageUrl, err);
          }
        }
        return <div className={ `col mb-4` } key={song.order}>
          <div className={ `card bg-${ (this.props.viewOnly) ? 'light' : 'secondary' } h-100 ${ (song.status === stageStatus.STATUS_COMPLETE) ? 'border-success' : ''}` }>
            <div className="imgWrapper" style={ { backgroundImage: `url('${(song.imageUrl) ? song.imageUrl : '/data/music/images/audio_article_banner.png'}')` } }>
              { (song.imageUrl && imgParsedUrl) ? <p className="card-text card-source"><em>Source: </em> { imgParsedUrl.host }</p> : '' }
            </div>
            <div className="card-body">
              <h5 className="card-title">{song.name} by {song.artist}</h5>
              { (song.location) ? <p className="card-text"><strong>📍 Location: </strong> {song.location}</p> : '' }
              <div className="card-text">
                <Markdown mdContent={song.content} />
              </div>
              { (song.historicalContext) ? <p className="card-text"><strong>📆 Historical Context: </strong> {song.historicalContext}</p> : '' }
            </div>
            <div className="card-footer actions">
              { this.renderActionBtn(song) }
            </div>
          </div>
        </div>
      });
    }
    else {
      console.error('No showcase items to showcase on the current quest.');
    }
  }

  triggerNextStage(countVisitedShowcaseItem) {
    if((countVisitedShowcaseItem >= this.props.activeStageData.requiredShowcaseViews)) {
      this.setState({
        loading: true,
      });
      this.props.goToNextStage(this.props.activeStageData);
    }
  }

  renderNextButton() {
    if (!this.props.viewOnly) {
      let countVisitedShowcaseItem = 0;
      this.props.activeStageData.showcaseItems.forEach((showcaseItem) => {
        if (showcaseItem.status === stageStatus.STATUS_COMPLETE) {
          countVisitedShowcaseItem++;
        }
      })

      // Only disable the next button if the player visited enough showcase items
      return <button
        className={`btn btn-primary btn-lg btn-next ${ (this.state.loading) ? 'loader' : ''}`}
        onClick={() => { this.triggerNextStage(countVisitedShowcaseItem) } }
        disabled={ (countVisitedShowcaseItem < this.props.activeStageData.requiredShowcaseViews) }
      >
        { (!this.state.loading) ? 'NEXT' : ''}
      </button>;
    }
    else {
      return <div>
        <h4>Showcases Quiz</h4>
        <Quiz quizData={this.props.activeStageData.quiz} inline={true}/>
      </div>
    }
  }

  render() {
    if (this.props.activeStageData) {
      return <div className="col-sm-12 instructionsWrapper">
        <div className="text-center">
          { this.renderNextButton() }
        </div>
        <p className="instructions">Explore at least <strong>{this.props.activeStageData.requiredShowcaseViews} examples</strong> below and click NEXT to complete the quest.</p>

        <div className={ `row songs ${ (this.props.viewOnly) ? 'row-cols-1' : 'row-cols-2 row-cols-md-3' }`}>
          { this.renderShowcaseItems() }
        </div>
      </div>
    }
  }
}

const mapStateToProps = (state) => {
  return {
    embeddedPage: state.embeddedPage,
    activePlayerData: getActivePlayerData(state),
    activeQuest: state.activeQuest,
    activeQuestData: getActiveQuestData(state),
    currentTab: state.currentTab,
  };
};

function mapDispatchToProps(dispatch) {
return bindActionCreators({ setActivePlayerSDG, changeQuestProgress, startQuest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MusicShowcase);
