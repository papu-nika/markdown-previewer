export default function Index() {
  return (
    <div>
      <div className="flex flex-col p-16 justify-center text-center">
        <p className="text-xl">Markdown Editor</p>
        <p className="text-base">
          マークダウンをプレビューしながら編集できるエディタです。
        </p>
        <p className="text-base">
          ファイルシステムに保存するため、コンテナを再起動するとデータが消えます。
        </p>
        <p className="text-base">
          プロジェクトを作成して、マークダウンを作成してください。
        </p>
      </div>
    </div>
  );
}
