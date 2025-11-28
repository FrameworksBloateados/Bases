type InfoBoxProps = {
  message: string;
};

export function InfoBox({message}: InfoBoxProps) {
  return (
    <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
      <p
        className="text-blue-300 text-sm"
        dangerouslySetInnerHTML={{__html: message}}
      />
    </div>
  );
}
