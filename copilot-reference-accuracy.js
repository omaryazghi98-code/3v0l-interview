(()=>{
  const D=window.INTERVIEW_DATA||{};
  const answers=D.answers||[];
  const stories=D.stories||[];

  // Accuracy corrections for interview facts. Keep employer/channel attribution explicit.
  const spotify=stories.find(x=>x.id==='spotify-multichat');
  if(spotify){
    spotify.text="Chez Spotify, je gérais régulièrement plusieurs conversations en direct en parallèle. Mon expérience sur ce projet était centrée sur le chat. Cela m'a appris à garder une structure claire pour chaque conversation, à repérer rapidement les informations importantes et à ne pas laisser le volume affecter la qualité de la réponse.";
    spotify.tags=[...(spotify.tags||[]).filter(t=>t!=='multi-channel'),'chat','multiple chats','high volume'];
  }

  const channels=answers.find(x=>x.id==='channels-fr');
  if(channels){
    channels.text="J'ai travaillé sur plusieurs canaux de support au cours de ma carrière, notamment le chat en direct, le téléphone, les e-mails, les SMS et le support back-office. Mon expérience sur ces canaux vient de plusieurs postes différents. Chez Spotify, mon expérience était centrée sur le chat, tandis que chez Comdata j'ai beaucoup travaillé sur le support téléphonique, notamment pour des cas plus complexes. J'ai aussi utilisé des outils de ticketing comme Zendesk et Salesforce, donc je suis à l'aise pour m'adapter au canal demandé.";
  }
})();
