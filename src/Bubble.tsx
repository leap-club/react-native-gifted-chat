import PropTypes from 'prop-types'
import React from 'react'
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { SwipeRow } from 'react-native-swipe-list-view'
import ViewMoreText from 'react-native-view-more-text'
import ParsedText from 'react-native-parsed-text'
import {
  mentionRegEx,
  replaceMentionValues,
} from 'react-native-controlled-mentions'

import QuickReplies from './QuickReplies'

import MessageText from './MessageText'
import MessageImage from './MessageImage'
import MessageVideo from './MessageVideo'
import MessageAudio from './MessageAudio'

import Time from './Time'
import Color from './Color'

import { StylePropType, isSameUser, isSameDay } from './utils'
import {
  User,
  IMessage,
  LeftRightStyle,
  Reply,
  Omit,
  MessageVideoProps,
  MessageAudioProps,
} from './Models'

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.leftBubbleBackground,
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.defaultBlue,
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  }),
  content: StyleSheet.create({
    tick: {
      fontSize: 10,
      backgroundColor: Color.backgroundTransparent,
      color: Color.white,
    },
    tickView: {
      flexDirection: 'row',
      marginRight: 10,
    },
    username: {
      fontSize: 12,
      backgroundColor: 'transparent',
      color: '#aaa',
    },
    usernameView: {
      flexDirection: 'row',
    },
    parentUsername: {
      fontSize: 12,
      backgroundColor: 'transparent',
      color: '#aaa',
    },
    parentText: {
      backgroundColor: 'transparent',
      fontSize: 14,
      lineHeight: 18,
    },
    parentMessageWrapper: {
      padding: 0,
    },
  }),
  header: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  })
}

const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel']

export type RenderMessageImageProps<TMessage extends IMessage> = Omit<
  BubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageImage['props']

export type RenderMessageVideoProps<TMessage extends IMessage> = Omit<
  BubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageVideoProps<TMessage>

export type RenderMessageAudioProps<TMessage extends IMessage> = Omit<
  BubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageAudioProps<TMessage>

export type RenderMessageTextProps<TMessage extends IMessage> = Omit<
  BubbleProps<TMessage>,
  'containerStyle' | 'wrapperStyle'
> &
  MessageText['props']

export interface BubbleProps<TMessage extends IMessage> {
  user?: User
  touchableProps?: object
  renderUsernameOnMessage?: boolean
  isCustomViewBottom?: boolean
  inverted?: boolean
  position: 'left' | 'right'
  currentMessage?: TMessage
  nextMessage?: TMessage
  previousMessage?: TMessage
  optionTitles?: string[]
  containerStyle?: LeftRightStyle<ViewStyle>
  wrapperStyle?: LeftRightStyle<ViewStyle>
  parentMessageWrapperStyle?: LeftRightStyle<ViewStyle>
  textStyle?: LeftRightStyle<TextStyle>
  bottomContainerStyle?: LeftRightStyle<ViewStyle>
  tickStyle?: StyleProp<TextStyle>
  containerToNextStyle?: LeftRightStyle<ViewStyle>
  containerToPreviousStyle?: LeftRightStyle<ViewStyle>
  usernameStyle?: TextStyle
  parentUsernameStyle?: LeftRightStyle<TextStyle>
  parentTextStyle?: LeftRightStyle<TextStyle>
  parentViewMoreBtnTextStyle?: TextStyle
  quickReplyStyle?: StyleProp<ViewStyle>
  onPress?(context?: any, message?: any): void
  onLongPress?(context?: any, message?: any): void
  onParentMessagePress?(message?: any): void
  onSwipe?(message?: any): void
  onQuickReply?(replies: Reply[]): void
  renderMessageImage?(props: RenderMessageImageProps<TMessage>): React.ReactNode
  renderMessageVideo?(props: RenderMessageVideoProps<TMessage>): React.ReactNode
  renderMessageAudio?(props: RenderMessageAudioProps<TMessage>): React.ReactNode
  renderMessageText?(props: RenderMessageTextProps<TMessage>): React.ReactNode
  renderCustomView?(bubbleProps: BubbleProps<TMessage>): React.ReactNode
  renderTime?(timeProps: Time['props']): React.ReactNode
  renderTicks?(currentMessage: TMessage): React.ReactNode
  renderUsername?(): React.ReactNode
  renderQuickReplySend?(): React.ReactNode
  renderQuickReplies?(quickReplies: QuickReplies['props']): React.ReactNode
}

export default class Bubble<
  TMessage extends IMessage = IMessage
> extends React.Component<BubbleProps<TMessage>> {
  static contextTypes = {
    actionSheet: PropTypes.func,
  }

  static defaultProps = {
    touchableProps: {},
    onPress: null,
    onLongPress: null,
    onParentMessagePress: null,
    onSwipe: null,
    renderMessageImage: null,
    renderMessageVideo: null,
    renderMessageAudio: null,
    renderMessageText: null,
    renderCustomView: null,
    renderUsername: null,
    renderTicks: null,
    renderTime: null,
    renderQuickReplies: null,
    onQuickReply: null,
    position: 'left',
    optionTitles: DEFAULT_OPTION_TITLES,
    currentMessage: {
      text: null,
      createdAt: null,
      image: null,
    },
    nextMessage: {},
    previousMessage: {},
    containerStyle: {},
    wrapperStyle: {},
    parentMessageWrapperStyle: {},
    bottomContainerStyle: {},
    tickStyle: {},
    usernameStyle: {},
    parentUsernameStyle: {},
    parentTextStyle: {},
    parentViewMoreBtnTextStyle: {},
    containerToNextStyle: {},
    containerToPreviousStyle: {},
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    touchableProps: PropTypes.object,
    onLongPress: PropTypes.func,
    renderMessageImage: PropTypes.func,
    renderMessageVideo: PropTypes.func,
    renderMessageAudio: PropTypes.func,
    renderMessageText: PropTypes.func,
    renderCustomView: PropTypes.func,
    isCustomViewBottom: PropTypes.bool,
    renderUsernameOnMessage: PropTypes.bool,
    renderUsername: PropTypes.func,
    renderTime: PropTypes.func,
    renderTicks: PropTypes.func,
    renderQuickReplies: PropTypes.func,
    onQuickReply: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    optionTitles: PropTypes.arrayOf(PropTypes.string),
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    wrapperStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    parentMessageWrapperStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    bottomContainerStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    tickStyle: StylePropType,
    usernameStyle: StylePropType,
    parentUsernameStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    parentTextStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    parentViewMoreBtnTextStyle: StylePropType,
    containerToNextStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
    containerToPreviousStyle: PropTypes.shape({
      left: StylePropType,
      right: StylePropType,
    }),
  }

  onPress = () => {
    if (this.props.onPress) {
      this.props.onPress(this.context, this.props.currentMessage)
    }
  }

  onParentMessagePress = () => {
    if (this.props.onParentMessagePress) {
      this.props.onParentMessagePress(this.props.currentMessage)
    }
  }

  onLongPress = () => {
    const { currentMessage } = this.props
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage)
    } else if (currentMessage && currentMessage.text) {
      const { optionTitles } = this.props
      const options =
        optionTitles && optionTitles.length > 0
          ? optionTitles.slice(0, 2)
          : DEFAULT_OPTION_TITLES
      const cancelButtonIndex = options.length - 1
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex: number) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(currentMessage.text)
              break
            default:
              break
          }
        },
      )
    }
  }

  styledBubbleToNext() {
    const {
      currentMessage,
      nextMessage,
      position,
      containerToNextStyle,
    } = this.props
    if (
      currentMessage &&
      nextMessage &&
      position &&
      isSameUser(currentMessage, nextMessage) &&
      isSameDay(currentMessage, nextMessage)
    ) {
      return [
        styles[position].containerToNext,
        containerToNextStyle && containerToNextStyle[position],
      ]
    }
    return null
  }

  styledBubbleToPrevious() {
    const {
      currentMessage,
      previousMessage,
      position,
      containerToPreviousStyle,
    } = this.props
    if (
      currentMessage &&
      previousMessage &&
      position &&
      isSameUser(currentMessage, previousMessage) &&
      isSameDay(currentMessage, previousMessage)
    ) {
      return [
        styles[position].containerToPrevious,
        containerToPreviousStyle && containerToPreviousStyle[position],
      ]
    }
    return null
  }

  renderQuickReplies() {
    const {
      currentMessage,
      onQuickReply,
      nextMessage,
      renderQuickReplySend,
      quickReplyStyle,
    } = this.props
    if (currentMessage && currentMessage.quickReplies) {
      const { containerStyle, wrapperStyle, ...quickReplyProps } = this.props
      if (this.props.renderQuickReplies) {
        return this.props.renderQuickReplies(quickReplyProps)
      }
      return (
        <QuickReplies
          {...{
            currentMessage,
            onQuickReply,
            nextMessage,
            renderQuickReplySend,
            quickReplyStyle,
          }}
        />
      )
    }
    return null
  }

  renderMessageText() {
    if (this.props.currentMessage && this.props.currentMessage.text) {
      const {
        containerStyle,
        wrapperStyle,
        optionTitles,
        ...messageTextProps
      } = this.props
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps)
      }
      return <MessageText {...messageTextProps} />
    }
    return null
  }

  renderMessageImage() {
    if (this.props.currentMessage && this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps)
      }
      return <MessageImage {...messageImageProps} />
    }
    return null
  }

  renderViewMore = (onPress: any) => {
    const { parentViewMoreBtnTextStyle } = this.props
    return (
      <Text onPress={onPress} style={parentViewMoreBtnTextStyle}>
        show more
      </Text>
    )
  }

  renderViewLess = (onPress: any) => {
    const { parentViewMoreBtnTextStyle } = this.props
    return (
      <Text onPress={onPress} style={parentViewMoreBtnTextStyle}>
        show less
      </Text>
    )
  }

  renderParentMessage() {
    if (
      this.props.currentMessage &&
      this.props.currentMessage.parent &&
      this.props.position
    ) {
      const {
        currentMessage,
        parentMessageWrapperStyle,
        position,
        parentTextStyle,
        parentUsernameStyle,
      } = this.props
      return (
        <View
          style={[
            styles.content.parentMessageWrapper,
            parentMessageWrapperStyle && parentMessageWrapperStyle[position],
          ]}
        >
          {currentMessage?.parent?.name ? (
            <Text
              style={
                [
                  styles.content.parentUsername,
                  parentUsernameStyle && parentUsernameStyle[position],
                ] as TextStyle
              }
            >
              {currentMessage?.parent?.name}
            </Text>
          ) : null}
          <ViewMoreText
            numberOfLines={5}
            renderViewMore={this.renderViewMore}
            renderViewLess={this.renderViewLess}
            style={
              [
                styles.content.parentText,
                parentTextStyle && parentTextStyle[position],
              ] as TextStyle
            }
          >
            <ParsedText
              style={
                [
                  styles.content.parentText,
                  parentTextStyle && parentTextStyle[position],
                ] as TextStyle
              }
              parse={[
                {
                  pattern: mentionRegEx,
                  renderText: value =>
                    replaceMentionValues(value, ({ name }) => `@${name}`),
                },
              ]}
              numberOfLines={4}
            >
              {currentMessage?.parent?.text}
            </ParsedText>
          </ViewMoreText>
        </View>
      )
    }
    return null
  }

  renderMessageVideo() {
    if (this.props.currentMessage && this.props.currentMessage.video) {
      const { containerStyle, wrapperStyle, ...messageVideoProps } = this.props
      if (this.props.renderMessageVideo) {
        return this.props.renderMessageVideo(messageVideoProps)
      }
      return <MessageVideo {...messageVideoProps} />
    }
    return null
  }

  renderMessageAudio() {
    if (this.props.currentMessage && this.props.currentMessage.audio) {
      const { containerStyle, wrapperStyle, ...messageAudioProps } = this.props
      if (this.props.renderMessageAudio) {
        return this.props.renderMessageAudio(messageAudioProps)
      }
      return <MessageAudio {...messageAudioProps} />
    }
    return null
  }

  renderTicks() {
    const { currentMessage, renderTicks, user } = this.props
    if (renderTicks && currentMessage) {
      return renderTicks(currentMessage)
    }
    if (
      currentMessage &&
      user &&
      currentMessage.user &&
      currentMessage.user._id !== user._id
    ) {
      return null
    }
    if (
      currentMessage &&
      (currentMessage.sent || currentMessage.received || currentMessage.pending)
    ) {
      return (
        <View style={styles.content.tickView}>
          {!!currentMessage.sent && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>
          )}
          {!!currentMessage.received && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>
          )}
          {!!currentMessage.pending && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>🕓</Text>
          )}
        </View>
      )
    }
    return null
  }

  renderTime() {
    if (this.props.currentMessage && this.props.currentMessage.createdAt) {
      const {
        containerStyle,
        wrapperStyle,
        textStyle,
        ...timeProps
      } = this.props
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps)
      }
      return <Time {...timeProps} />
    }
    return null
  }

  renderUsername() {
    // const { currentMessage, user, previousMessage } = this.props
    const { currentMessage, previousMessage } = this.props
    if (this.props.renderUsernameOnMessage && currentMessage) {
      // if (user && currentMessage.user._id === user._id) {
      //   return null
      // }
      if (previousMessage && isSameUser(currentMessage, previousMessage)) {
        return null
      }
      return (
        <View style={styles.content.usernameView}>
          <Text
            style={
              [styles.content.username, this.props.usernameStyle] as TextStyle
            }
          >
            {currentMessage.user.name}
          </Text>
        </View>
      )
    }
    return null
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props)
    }
    return null
  }

  renderBubbleContent() {
    const { currentMessage, previousMessage } = this.props;

    const isSameThread = currentMessage && previousMessage && isSameUser(currentMessage, previousMessage);

    const messageHeader = isSameThread ? null : (
      <View style={styles.header.container}>
        {this.renderUsername()}
        {this.renderTime()}
      </View>
    );

    return this.props.isCustomViewBottom ? (
      <View>
        {messageHeader}
        {this.renderParentMessage()}
        {this.renderMessageImage()}
        {this.renderMessageVideo()}
        {this.renderMessageAudio()}
        {this.renderMessageText()}
        {this.renderCustomView()}
      </View>
    ) : (
      <View>
        {messageHeader}
        {this.renderParentMessage()}
        {this.renderCustomView()}
        {this.renderMessageImage()}
        {this.renderMessageVideo()}
        {this.renderMessageAudio()}
        {this.renderMessageText()}
      </View>
    )
  }

  onSwipe = ({ isActivated }: { isActivated: boolean }) => {
    if (isActivated && this.props.onSwipe) {
      this.props.onSwipe(this.props.currentMessage)
    }
  }

  render() {
    const {
      position,
      containerStyle,
      wrapperStyle,
      bottomContainerStyle,
    } = this.props
    return (
      <SwipeRow
        useNativeDriver
        onLeftActionStatusChange={this.onSwipe}
        disableLeftSwipe
        leftActivationValue={20}
        leftActionValue={0}
      >
        <></>
        <View
          style={[
            styles[position].container,
            containerStyle && containerStyle[position],
          ]}
        >
          <View
            style={[
              styles[position].wrapper,
              this.styledBubbleToNext(),
              this.styledBubbleToPrevious(),
              wrapperStyle && wrapperStyle[position],
            ]}
          >
            <TouchableWithoutFeedback
              onPress={this.onPress}
              onLongPress={this.onLongPress}
              accessibilityTraits='text'
              {...this.props.touchableProps}
            >
              <View>
                {this.renderBubbleContent()}
                <View
                  style={[
                    styles[position].bottom,
                    bottomContainerStyle && bottomContainerStyle[position],
                  ]}
                >
                  {this.renderTicks()}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
          {this.renderQuickReplies()}
        </View>
      </SwipeRow>
    )
  }
}
