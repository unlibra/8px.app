# Tailwind風パレット生成アルゴリズム

## 概要

任意の入力色から、Tailwind CSS風の50-950シェードを持つカラーパレットを生成するアルゴリズム。

**特徴：**

- LCh色空間による知覚的に均一な補間
- 6アンカーカラー補間による滑らかな色相遷移
- 入力色の色相・彩度レベルを保持
- 非常に薄い色のグレー化を防止

## 核心アルゴリズム

### 1. アンカーポイント補間

6つの代表色（アンカー）の曲線データを保持：

```
red:    31.2°
yellow: 84.3°
green:  146.9°
cyan:   223.2°
blue:   285.2°
purple: 312.7°
```

入力色の色相に応じて、**隣接する2つのアンカーの曲線を線形補間**：

```typescript
// 入力色相 H=200° の場合
// green (146.9°) と cyan (223.2°) の間に位置

距離1 = 200° - 146.9° = 53.1°
距離2 = 223.2° - 200° = 23.2°
合計 = 76.3°

ブレンド比率 = 53.1° / 76.3° = 0.696

// 各shadeの値を補間
Lightness[shade] = lerp(GREEN_L[shade], CYAN_L[shade], 0.696)
Chroma[shade]    = lerp(GREEN_C[shade], CYAN_C[shade], 0.696)
HueShift[shade]  = lerpAngle(GREEN_H[shade], CYAN_H[shade], 0.696)
```

**利点：** 色相環上のどの色でも滑らかに補間され、境界での不連続性がない

### 2. 入力色の処理

```typescript
入力: #ECFEFF (非常に薄いシアン)
LCh: L=98.4, C=6.2, H=203.8°

// 1. 常にshade 500を基準として扱う（明度は無視）
shade500ExpectedChroma = getBlendedValue(203.8°, 500, 'chroma')
                       = 37.8  // 補間された期待値

// 2. 相対的な彩度スケールを計算
chromaScale = 6.2 / 37.8 = 0.164

// 3. 低彩度ブースト適用（グレー化防止）
threshold = 37.8 × 0.5 = 18.9
minScale = min(1.0, 6.2 / 18.9) = 0.328
chromaScale = max(0.164, 0.328) = 0.328

// 4. 基準色相（入力色尊重）
baseHue = 203.8°
```

### 3. パレット生成

```typescript
for (shade of [50, 100, 200, ..., 950]) {
  // 補間された曲線から値を取得
  L = getBlendedValue(203.8°, shade, 'lightness')
  standardC = getBlendedValue(203.8°, shade, 'chroma')
  hShift = getBlendedValue(203.8°, shade, 'hueShift')

  // 最終値を計算
  finalL = L                           // Tailwind標準の明度
  finalC = standardC × chromaScale     // 相対的にスケール
  finalH = baseHue + hShift            // 入力色相を基準

  // LCh → HEX変換（ガマットマッピング付き）
  palette[shade] = lchToHex({L: finalL, C: finalC, H: finalH})
}
```

## 低彩度ブースト

非常に薄い色がグレーになる問題を解決：

```typescript
const CHROMA_BOOST_THRESHOLD_RATIO = 0.5  // 調整可能 (0.3-0.6)

threshold = expectedChroma × 0.5
minScale = min(1.0, inputC / threshold)
chromaScale = max(baseScale, minScale)
```

**動作：**

- 入力C < threshold: ブースト適用
- 入力C ≥ threshold: 相対スケールのみ

**トレードオフ：**

```
比率 0.3: 強力ブースト / くすんだ色も過剰に鮮やか
比率 0.5: バランス良好 / 副作用軽微
比率 0.6: くすみ保持 / 薄い色が不十分
```

## ガマットマッピング

sRGB範囲外の色は、**明度と色相を保持してChromaを調整**：

```typescript
function lchToRgbWithGamutMapping(lch: LCh): RGB {
  // 1. そのままRGB変換を試行
  if (isInGamut(lch)) return lchToRgb(lch)

  // 2. バイナリサーチで最大Chromaを探索
  let low = 0, high = lch.c
  while (high - low > 0.01) {
    mid = (low + high) / 2
    if (isInGamut({l: lch.l, c: mid, h: lch.h})) {
      low = mid
    } else {
      high = mid
    }
  }

  // 3. L/H保持、C調整で変換
  return lchToRgb({l: lch.l, c: low, h: lch.h})
}
```

## アンカーカラーデータ構造

各アンカーは3つの曲線を持つ：

```typescript
interface AnchorCurves {
  centerHue: number  // shade 500の色相
  lightness: Record<TailwindShade, number>  // 各shadeの明度
  chroma: Record<TailwindShade, number>     // 各shadeの彩度
  hueShift: Record<TailwindShade, number>   // shade 500からの色相回転
}

// 例：cyan
{
  centerHue: 223.2,
  lightness: {
    50: 98.4, 100: 95.5, 200: 91.3, 300: 85.7, 400: 77.9,
    500: 68.2, 600: 55.6, 700: 45.1, 800: 36.8, 900: 30.7, 950: 19.4
  },
  chroma: {
    50: 6.2, 100: 14.4, 200: 24.7, 300: 36.1, 400: 40.8,
    500: 37.8, 600: 33.1, 700: 28.0, 800: 23.2, 900: 20.2, 950: 16.4
  },
  hueShift: {
    50: -19.5, 100: -16.5, 200: -14.4, 300: -11.5, 400: -5.2,
    500: 0.0, 600: 9.4, 700: 11.3, 800: 12.5, 900: 16.6, 950: 20.3
  }
}
```

## 具体例

### 入力：#ECFEFF（非常に薄いシアン）

```
【入力解析】
LCh = (98.4, 6.2, 203.8°)

【隣接アンカー検出】
green (146.9°) ← 57°
cyan (223.2°)  → 19°
ブレンド比率 = 57 / (57+19) = 0.75

【彩度スケール計算】
期待値 = 37.8 (補間値)
基本スケール = 6.2 / 37.8 = 0.164
閾値 = 37.8 × 0.5 = 18.9
最小スケール = 6.2 / 18.9 = 0.328
最終スケール = max(0.164, 0.328) = 0.328

【shade 500生成】
L = 68.2 (補間された標準明度)
C = 37.8 × 0.328 = 12.4 (ブースト適用)
H = 203.8° + 0.0° = 203.8°

結果: #8BAEB0 (可視的なシアン)
```

### 入力：#FF0000（純粋な赤）

```
【入力解析】
LCh = (53.2, 104.6, 40.0°)

【隣接アンカー検出】
red (31.2°)    → 9°
yellow (84.3°) ← 44°
ブレンド比率 = 9 / 53 = 0.17 (redに近い)

【彩度スケール計算】
期待値 = 75.6
基本スケール = 104.6 / 75.6 = 1.38
最終スケール = 1.38 (閾値以上なのでブーストなし)

【shade 500生成】
L = 55.0
C = 75.6 × 1.38 = 104.3
H = 40.0° + 0.0° = 40.0°

結果: 高彩度を保持した赤系パレット
```

## API

```typescript
// シンプルなAPI（入力色尊重のみ）
function generatePalette(
  inputHex: string,
  options?: {
    hueShift?: number  // 色相調整（デフォルト: 0）
  }
): ColorPalette | null

// 使用例
const palette = generatePalette('#ECFEFF')
// palette[500] = '#8BAEB0'
// palette[200] = '#D5EBE8'
// ... 全11シェード
```

## アルゴリズムの利点

1. **滑らかな補間**: 6アンカー間を線形補間、境界の不連続性なし
2. **入力色保持**: 色相と彩度レベル（vividness）を維持
3. **グレー化防止**: 低彩度ブーストで薄い色も可視的
4. **ガマット対応**: L/H保持でsRGB範囲内に収める
5. **シンプルAPI**: オプション最小限、直感的な動作

## 調整可能パラメータ

**CHROMA_BOOST_THRESHOLD_RATIO**（現在: 0.5）

- 0.3-0.6の範囲で調整可能
- 低い値: 薄い色を強くブースト（くすんだ色も鮮やかに）
- 高い値: くすんだ色を保持（薄い色のブースト控えめ）

## データ抽出

アンカーカラーデータは以下のスクリプトで抽出：

```bash
# 6アンカーカラーのデータ抽出
npx tsx scripts/extract-anchor-colors.ts

# 各色の中心色相を特定
npx tsx scripts/find-color-centers.ts
```
