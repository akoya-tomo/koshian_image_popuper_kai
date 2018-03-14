##  KOSHIAN カタログの画像をポップアップで表示 改
このFirefoxアドオンは[Pachira](https://addons.mozilla.org/ja/firefox/user/anonymous-a0bba9187b568f98732d22d51c5955a6/)氏の[KOSHIAN カタログの画像をポップアップで表示](https://addons.mozilla.org/ja/firefox/addon/koshian-image-popuper/)アドオンを改変したものです。  
ポップアップのリンクを有効にするオプションやポップアップにスレ画像のサムネを使用するオプションなどをオリジナル版に追加しています。  

※このアドオンはWebExtensionアドオン対応のFirefox専用となります。  
※他のKOSHIANアドオン改変版とUserscriptは[こちら](https://github.com/akoya-tomo/futaba_auto_reloader_K/wiki/)の一覧からどうぞ。  

## 機能
* オリジナルの機能（KOSHIAN カタログの画像をポップアップで表示）
  - ふたば☆ちゃんねるのカタログのスレ画像をポップアップ表示
* 追加された機能（KOSHIAN カタログの画像をポップアップで表示 改）
  - \(New\) ポップアップのリンクを有効にするオプション（デフォルト：無効）  
  ポップアップをクリックしてスレを開くことができます。  
  WebMは「動画のコントロールを表示」オプションが無効のときのみリンクが有効になります。  
  - \(New\) ポップアップにスレ画像のサムネを使用するオプション（デフォルト：無効）  
  有効にするとポップアップにスレ画像のサムネを使用します。ポップアップの読み込みが重いときに効果が期待できます。無効にするとオリジナルサイズのスレ画像を使用します。  
  WebMには影響しません。  
  - \(New\) ポップアップに背景色を設定  
  透過PNG画像のポップアップの視認性を向上させるため背景色を設定しました。  
  - スレ画像が404の時にNoImageを表示する機能  
  スレ画像がポップアップしない原因が、応答が遅いのか、スレが消えたからなのかが判りにくいので、スレが消えたときはNoImageを表示するようにしました。  

## インストール
[GitHub](https://github.com/akoya-tomo/koshian_image_popuper_kai/releases/download/v1.1.0/koshian_image_popuper_kai-1.1.0-an.fx.xpi)  

※「接続エラーのため、アドオンをダウンロードできませんでした。」と表示されてインストール出来ない時はリンクを右クリックしてxpiファイルをダウンロードし、メニューのツール→アドオン（またはCtrl+Shift+A）で表示されたアドオンマネージャーのページにxpiファイルをドラッグ＆ドロップして下さい。  

## 注意事項
* このアドオンはWebExtensionアドオン対応のFirefox専用です。  
* 本アドオンを有効化したときはオリジナル版を無効化または削除して下さい。  
* オリジナル版とは別アドオンなので設定は初期値に戻ります。  
  再度設定をお願い致します。  
* v1.1.0にてポップアップのパフォーマンスに影響する不具合を修正したので、バージョンアップをお願い致します。

## 更新履歴
* v1.1.0 2018-03-15
  - ポップアップのリンクを有効にするオプションを追加
  - ポップアップにスレ画像のサムネを使用するオプションを追加
  - ポップアップに背景色を設定
  - ポップアップを多重に読み込む不具合を修正
  - アドオンの自動更新を有効化
* v1.0.1 2017-12-17
  - NoImageの表示サイズが無駄に大きかったので調整
* v1.0.0 2017-12-17
  - KOSHIAN カタログの画像をポップアップで表示 v1.0.4ベース
  - スレ画像が404の時にNoImageを表示する機能を追加
