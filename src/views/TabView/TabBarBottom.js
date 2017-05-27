/* @flow */

import React, { PureComponent } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import TabBarIcon from './TabBarIcon';

import type {
  NavigationAction,
  NavigationRoute,
  NavigationState,
  NavigationScreenProp,
  Style,
} from '../../TypeDefinition';

import type { TabScene } from './TabView';

type DefaultProps = {
  activeTintColor: string,
  activeBackgroundColor: string,
  activeStickColor: string,
  inactiveTintColor: string,
  inactiveBackgroundColor: string,
  inactiveStickColor: string,
  showLabel: boolean,
};

type Props = {
  activeTintColor: string,
  activeBackgroundColor: string,
  activeStickColor: string,
  inactiveTintColor: string,
  inactiveBackgroundColor: string,
  inactiveStickColor: string,
  position: Animated.Value,
  navigation: NavigationScreenProp<NavigationState, NavigationAction>,
  jumpToIndex: (index: number) => void,
  getLabel: (scene: TabScene) => ?(React.Element<*> | string),
  renderIcon: (scene: TabScene) => React.Element<*>,
  showLabel: boolean,
  style?: Style,
  labelStyle?: Style,
  tabStyle?: Style,
  showIcon: boolean,
  underlineEnabled: boolean,
  underlineSyle?: Style,
};

export default class TabBarBottom
  extends PureComponent<DefaultProps, Props, void> {
  // See https://developer.apple.com/library/content/documentation/UserExperience/Conceptual/UIKitUICatalog/UITabBar.html
  static defaultProps = {
    activeTintColor: '#3478f6', // Default active tint color in iOS 10
    activeBackgroundColor: 'transparent',
    activeStickColor: '#cc0000',
    inactiveTintColor: '#929292', // Default inactive tint color in iOS 10
    inactiveBackgroundColor: 'transparent',
    inactiveStickColor: '#f4f4f4',
    showLabel: true,
    showIcon: true,
    underlineEnabled: false,
    underlineSyle: {}
  };

  props: Props;

  _renderLabel = (scene: TabScene) => {
    const {
      position,
      navigation,
      activeTintColor,
      inactiveTintColor,
      labelStyle,
      showLabel,
    } = this.props;
    if (showLabel === false) {
      return null;
    }
    const { index } = scene;
    const { routes } = navigation.state;
    // Prepend '-1', so there are always at least 2 items in inputRange
    const inputRange = [-1, ...routes.map((x: *, i: number) => i)];
    const outputRange = inputRange.map(
      (inputIndex: number) =>
        inputIndex === index ? activeTintColor : inactiveTintColor
    );
    const color = position.interpolate({
      inputRange,
      outputRange,
    });

    const tintColor = scene.focused ? activeTintColor : inactiveTintColor;
    const label = this.props.getLabel({ ...scene, tintColor });
    if (typeof label === 'string') {
      return (
        <Animated.Text style={[styles.label, { color }, labelStyle]}>
          {label}
        </Animated.Text>
      );
    }

    if (typeof label === 'function') {
      return label({ ...scene, tintColor });
    }

    return label;
  };

  _renderIcon = (scene: TabScene) => {
    const {
      position,
      navigation,
      activeTintColor,
      inactiveTintColor,
      renderIcon,
      showIcon,
    } = this.props;
    if (showIcon === false) {
      return null;
    }
    return (
      <TabBarIcon
        position={position}
        navigation={navigation}
        activeTintColor={activeTintColor}
        inactiveTintColor={inactiveTintColor}
        renderIcon={renderIcon}
        scene={scene}
        style={styles.icon}
      />
    );
  };

  render() {
    const {
      position,
      navigation,
      jumpToIndex,
      activeBackgroundColor,
      activeStickColor,
      inactiveBackgroundColor,
      inactiveStickColor,
      style,
      tabStyle,
      underlineEnabled,
      underlineSyle
    } = this.props;
    const { routes } = navigation.state;
    // Prepend '-1', so there are always at least 2 items in inputRange
    const inputRange = [-1, ...routes.map((x: *, i: number) => i)];
    const stickInputRange = [-1, ...routes.map((x: *, i: number) => i)];
    return (
      <Animated.View style={[styles.tabBar, style]}>
        {routes.map((route: NavigationRoute, index: number) => {
          const focused = index === navigation.state.index;
          const scene = { route, index, focused };
          const outputRange = inputRange.map(
            (inputIndex: number) =>
              inputIndex === index ? activeBackgroundColor : inactiveBackgroundColor
          );
          const stickOutputRange = stickInputRange.map(
            (inputIndex: number) =>
              inputIndex === index ? activeStickColor : inactiveStickColor
          );
          const backgroundColor = position.interpolate({
            inputRange,
            outputRange,
          });
          console.log('Stick: ', stickInputRange, stickOutputRange);
          const stickColor = position.interpolate({
            stickInputRange,
            stickOutputRange
          });
          const justifyContent = this.props.showIcon ? 'flex-end' : 'center';
          return (
            <TouchableWithoutFeedback
              key={route.key}
              onPress={() => jumpToIndex(index)}
            >
              <Animated.View
                style={[
                  styles.tab,
                  { backgroundColor, justifyContent },
                  tabStyle,
                ]}
              >
                {this._renderIcon(scene)}
                {this._renderLabel(scene)}
              </Animated.View>
            </TouchableWithoutFeedback>
          );
        })}
        {underlineEnabled &&  <Animated.View style={[styles.stick, {backgroundColor:stickColor}, underlineSyle]} /> }
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  tabBar: {
    height: 49, // Default tab bar height in iOS 10
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, .2)',
    backgroundColor: '#f4f4f4', // Default background color in iOS 10
  },
  tab: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  stick: {
    flex: 1,
    height:5,
    position:'relative',
    left:0,
    top:0,
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  icon: {
    flexGrow: 1,
  },
  label: {
    textAlign: 'center',
    fontSize: 10,
    marginBottom: 1.5,
    backgroundColor: 'transparent',
  },
});
