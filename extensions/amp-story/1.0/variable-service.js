import {Services} from '#service';

import {StateProperty, getStoreService} from './amp-story-store-service';

import {registerServiceBuilder} from '../../../src/service-helpers';

/**
 * @typedef {!JsonObject}
 */
export let StoryVariableDef;

/** @enum {string} */
export const AnalyticsVariable = {
  STORY_INTERACTIVE_ID: 'storyInteractiveId',
  STORY_INTERACTIVE_RESPONSE: 'storyInteractiveResponse',
  STORY_INTERACTIVE_TYPE: 'storyInteractiveType',
  STORY_PAGE_ID: 'storyPageId',
  STORY_PAGE_INDEX: 'storyPageIndex',
  STORY_PAGE_COUNT: 'storyPageCount',
  STORY_IS_MUTED: 'storyIsMuted',
  STORY_PROGRESS: 'storyProgress',
  STORY_PREVIOUS_PAGE_ID: 'storyPreviousPageId',
  STORY_ADVANCEMENT_MODE: 'storyAdvancementMode',
};

/**
 * Util function to retrieve the variable service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param {!Window} win
 * @return {!AmpStoryVariableService}
 */
export const getVariableService = (win) => {
  let service = Services.storyVariableService(win);

  if (!service) {
    service = new AmpStoryVariableService(win);
    registerServiceBuilder(win, 'story-variable', function () {
      return service;
    });
  }

  return service;
};

/**
 * Variable service for amp-story.
 * Used for URL replacement service. See usage in src/url-replacements-impl.
 */
export class AmpStoryVariableService {
  /**
   * @param {!Window} win
   * @public
   */
  constructor(win) {
    /** @private {!StoryVariableDef} */
    this.variables_ = {
      [AnalyticsVariable.STORY_INTERACTIVE_ID]: null,
      [AnalyticsVariable.STORY_INTERACTIVE_RESPONSE]: null,
      [AnalyticsVariable.STORY_INTERACTIVE_TYPE]: null,
      [AnalyticsVariable.STORY_PAGE_INDEX]: null,
      [AnalyticsVariable.STORY_PAGE_ID]: null,
      [AnalyticsVariable.STORY_PAGE_COUNT]: null,
      [AnalyticsVariable.STORY_PROGRESS]: null,
      [AnalyticsVariable.STORY_IS_MUTED]: null,
      [AnalyticsVariable.STORY_PREVIOUS_PAGE_ID]: null,
      [AnalyticsVariable.STORY_ADVANCEMENT_MODE]: null,
    };

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(win);

    this.initializeListeners_();
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.PAGE_IDS, (pageIds) => {
      this.variables_[AnalyticsVariable.STORY_PAGE_COUNT] = pageIds.length;
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (pageId) => {
        if (!pageId) {
          return;
        }

        this.variables_[AnalyticsVariable.STORY_PREVIOUS_PAGE_ID] =
          this.variables_[AnalyticsVariable.STORY_PAGE_ID];

        this.variables_[AnalyticsVariable.STORY_PAGE_ID] = pageId;

        const pageIndex = /** @type {number} */ (
          this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX)
        );
        this.variables_[AnalyticsVariable.STORY_PAGE_INDEX] = pageIndex;

        const numberOfPages = this.storeService_.get(
          StateProperty.PAGE_IDS
        ).length;
        if (numberOfPages > 0) {
          if (numberOfPages === 1) {
            this.variables_[AnalyticsVariable.STORY_PROGRESS] = 0;
          } else {
            this.variables_[AnalyticsVariable.STORY_PROGRESS] =
              pageIndex / (numberOfPages - 1);
          }
        }
      },
      true /* callToInitialize */
    );
  }

  /**
   * Updates a variable with a new value
   * @param {string} name
   * @param {*} update
   */
  onVariableUpdate(name, update) {
    this.variables_[name] = update;
  }

  /**
   * @return {!StoryVariableDef}
   */
  get() {
    // TODO(newmius): You should probably Object.freeze this in development.
    return this.variables_;
  }
}
