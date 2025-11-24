import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from './theme';

const { width } = Dimensions.get('window');

interface CurvedHeaderProps {
  title: string;
  name?: string;
  subtitle?: string;
}

export function CurvedHeader({ title, name, subtitle }: CurvedHeaderProps) {
  const height = 160;

  return (
    <View style={{ width, height: height - 24 }}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={StyleSheet.absoluteFill}>
        <Path
          d={`M0 0 H${width} V${height - 40} Q${width / 2} ${height} 0 ${
            height - 40
          } Z`}
          fill="#2196f3"
        />
      </Svg>
      <View style={styles.content}>
        <View style={styles.avatarRow}>
          {name ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : null}
          <View style={styles.textContainer}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0f2fe',
  },
  textContainer: {
    flexShrink: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0f2fe',
  },
});
