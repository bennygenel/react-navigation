/* @flow */

import React, { PureComponent } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet, Dimensions } from 'react-native';
import TabBarIcon from './TabBarIcon';

import type {
  NavigationAction,
  NavigationRoute,
  NavigationState,
  NavigationScreenProp,
  Style,
} from '../../TypeDefinition';

import type { TabScene } from './TabView';

const {width, height} = Dimensions.get('window');

type DefaultProps = {
  activeTintColor: string,
  activeBackgroundColor: string,
  inactiveTintColor: string,
  inactiveBackgroundColor: string,
  showLabel: boolean,
};

type Props = {
  activeTintColor: string,
  activeBackgroundColor: string,
  inactiveTintColor: string,
  inactiveBackgroundColor: string,
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
  underlineColor:string,
  underlineSyle?: Style,
};

export default class TabBarBottom
  extends PureComponent<DefaultProps, Props, void> {
  // See https://developer.apple.com/library/content/documentation/UserExperience/Conceptual/UIKitUICatalog/UITabBar.html
  static defaultProps = {
    activeTintColor: '#3478f6', // Default active tint color in iOS 10
    activeBackgroundColor: 'transparent',
    inactiveTintColor: '#929292', // Default inactive tint color in iOS 10
    inactiveBackgroundColor: 'transparent',
    showLabel: true,
    showIcon: true,
    underlineEnabled: false,
    underlineColor: '#cc0000',
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
      inactiveBackgroundColor,
      style,
      tabStyle,
      tabBarHeight,
      underlineEnabled,
      underlineColor,
      underlineSyle
    } = this.props;
    const { routes } = navigation.state;
    // Prepend '-1', so there are always at least 2 items in inputRange
    const inputRange = [-1, ...routes.map((x: *, i: number) => i)];
    const stickInputRange = [-1, ...routes.map((x: *, i: number) => i)];
    let tabCount = routes.length;
    let stickWidth = (width / tabCount);
    let stickPosition;

    return (
      <Animated.View style={[styles.tabBar,{ paddingBottom:(underlineEnabled ? 5 : 0), height: (tabBarHeight ? tabBarHeight : 49)}, style]}>
        {routes.map((route: NavigationRoute, index: number) => {
          const focused = index === navigation.state.index;
          const scene = { route, index, focused };
          const outputRange = inputRange.map(
            (inputIndex: number) =>
              inputIndex === index ? activeBackgroundColor : inactiveBackgroundColor
          );
          const backgroundColor = position.interpolate({
            inputRange,
            outputRange,
          });
          let stickInputRange = [];
          let stickOutputRange = [];
          for(let i = 0; i < tabCount; i++) {
            stickInputRange.push(i);
            stickOutputRange.push(i * stickWidth);
          }
          stickPosition = position.interpolate({
            inputRange:stickInputRange,
            outputRange:stickOutputRange,
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
        {underlineEnabled &&
          <Animated.View style={[styles.stick, {width: stickWidth, top:(tabBarHeight ? (tabBarHeight - 5) : 44), left:stickPosition, backgroundColor:underlineColor}, underlineSyle]} />
        }
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
    top:25,
    position:'absolute',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
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
