import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from './theme';
import { Icon } from './Icon';

const { width } = Dimensions.get('window');

interface CurvedHeaderProps {
  title: string;
  name?: string;
  subtitle?: string;
  outletCode?: string;
}

export function CurvedHeader({ title, name, subtitle, outletCode }: CurvedHeaderProps) {
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
              <Icon name="profile" size={22} color="#0ea5e9" />
            </View>
          ) : null}
          <View style={styles.textContainer}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {(subtitle || outletCode) && (
              <View style={styles.subtitleRow}>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {outletCode ? (
                  <View style={styles.outletBadge}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#22c55e',
                        marginRight: 6,
                      }}
                    />
                    <Text style={styles.outletBadgeText}>{outletCode}</Text>
                  </View>
                ) : null}
              </View>
            )}
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
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0f2fe',
    marginRight: 6,
  },
  outletBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(226, 232, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 255, 0.45)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  outletBadgeText: {
    fontSize: 11,
    color: '#e0f2fe',
    fontWeight: '500',
  },
});
