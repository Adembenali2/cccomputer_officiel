window.buildClientContractPreview = function buildClientContractPreview(data) {
  return [
    `Contrat N°: ${data.contractNumber}`,
    `Code client: ${data.codeInterne}`,
    "",
    `Raison sociale: ${data.raisonSociale}`,
    `Dirigeant: ${data.dirigeant}`,
    `Email: ${data.email}`,
    `Telephone: ${data.telephone}`,
    `Adresse: ${data.adresse}, ${data.codePostal} ${data.ville}`,
    `SIRET: ${data.siret}`,
    `Offre: ${data.offre}`,
  ].join("\n");
};

window.generateClientContractPdf = async function generateClientContractPdf(data) {
  if (!window.jspdf?.jsPDF) return false;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210, H = 297, ML = 15, MR = 15, CW = W - ML - MR;

  // === CONSTANTES SOCIÉTÉ (à adapter) ===
  const CO_NOM    = "Cccomputer";
  const CO_MAJ    = "CCCOMPUTER";
  const CO_ADR1   = "XX, rue XXXXXXXXXX";
  const CO_CP_VIL = "XXXXX XXXXX";
  const CO_SIRET  = "XXXXXXXXXXXXXXX";
  const CO_TEL    = "XX XX XX XX XX";

  // === Y courant (modifié par les helpers) ===
  let y = 15;

  // === HELPERS ===
  function checkPage(needed) {
    if (y + (needed || 8) > H - 15) {
      doc.addPage();
      y = 15;
    }
  }

  function hline(yy, x1, x2, lw) {
    doc.setLineWidth(lw || 0.3);
    doc.setDrawColor(0);
    doc.line(x1 !== undefined ? x1 : ML, yy, x2 !== undefined ? x2 : ML + CW, yy);
  }

  function rect(x, ry, w, h, dashed) {
    doc.setLineWidth(0.3);
    doc.setDrawColor(0);
    if (dashed) doc.setLineDashPattern([1.2, 1.2], 0);
    else doc.setLineDashPattern([], 0);
    doc.rect(x, ry, w, h);
    doc.setLineDashPattern([], 0);
  }

  function chk(x, cy) {
    doc.setLineWidth(0.3);
    doc.rect(x, cy - 3.5, 4, 4);
  }

  // Écrit du texte avec wrap. Utilise/modifie y par closure.
  function txt(text, x, maxW, lh, bold, size, underline) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size || 8.5);
    const lines = doc.splitTextToSize(String(text || ""), maxW || CW);
    lines.forEach((line) => {
      checkPage(lh || 4.8);
      doc.text(line, x || ML, y);
      if (underline) hline(y + 0.8, x || ML, (x || ML) + doc.getTextWidth(line), 0.3);
      y += lh || 4.8;
    });
  }

  function txtInline(parts, x, lh) {
    // parts = [{t, bold, size, underline}]
    let cx = x || ML;
    const maxH = lh || 4.8;
    checkPage(maxH);
    parts.forEach((p) => {
      doc.setFont("helvetica", p.bold ? "bold" : "normal");
      doc.setFontSize(p.size || 8.5);
      doc.text(p.t, cx, y);
      if (p.underline) hline(y + 0.8, cx, cx + doc.getTextWidth(p.t), 0.3);
      cx += doc.getTextWidth(p.t);
    });
    y += maxH;
  }

  function articleTitle(title) {
    checkPage(14);
    y += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title, ML, y);
    hline(y + 0.8, ML, ML + doc.getTextWidth(title), 0.4);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
  }

  function sectionTitle(title) {
    checkPage(10);
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title, ML, y);
    hline(y + 0.8, ML, ML + doc.getTextWidth(title), 0.4);
    y += 6;
  }

  // === LOGO ===
  const readLogo = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) { reject(new Error("ctx")); return; }
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("logo"));
    img.src = src;
  });
  try {
    const logoData = await readLogo("assets/img/logo.png");
    doc.addImage(logoData, "PNG", ML, 8, 28, 22);
  } catch (_) {}

  // ================================================================
  // PAGE 1
  // ================================================================

  // Logo + nom société
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(CO_NOM, ML + 32, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Group", ML + 32, 23);

  y = 35;

  // Titre
  rect(ML, y, CW, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("CONTRAT DE LOCATION PHOTOCOPIEUR", W / 2, y + 7.5, { align: "center" });
  y += 17;

  // --- Tarif ---
  sectionTitle("Tarif :");
  txt(
    "Le coût de la location d'un photocopieur multifonctions devra être réglé mensuellement par le client sur une durée de 60mois.",
    ML, CW
  );
  txt("Ce coût se calcule de la façon suivante:", ML, CW);
  y += 2;

  txt("Base minimum de 1000/copies en N&B par mois :", ML, CW, 5, true);
  txt("83,33€ (100€TTC) /mois HT fixe", ML, CW, 5, true);
  y += 3;
  txt("Si le nombre excède 1000 copies N&B /mois :", ML, CW, 5, true);
  y += 1;
  const rows = [
    ["+ 1000 copies/mois N&B",    "0,05€ centimes HT"],
    ["+ 10 000 copies/mois N&B",  "0,04€ centimes HT"],
    ["+ 25 000 copies/mois N&B",  "0,03€ centimes HT"],
    ["+ 0 Copies/mois Couleur",   "0,09€ centimes HT"],
    ["+ 10 000 Copies/mois Couleur", "0,08€ centimes HT"],
  ];
  rows.forEach(([label, price]) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text(label, ML + 4, y);
    doc.setFont("helvetica", "normal");
    doc.text(price, ML + 80, y);
    y += 5;
  });
  y += 4;

  // --- Matériel fournis ---
  sectionTitle("Matériel fournis :");
  txt("Photocopieur (garantie sur site), câble Ethernet ou USB cordons d'alimentations, consommables.", ML, CW);
  y += 4;

  // --- Cautions ---
  sectionTitle("Cautions :");
  txt(
    `Le client s'engage à verser le montant de 333,33€ HT (400€ TTC) dépôt de garantie. (Cochez ci-dessous le mode de paiement choisi)`,
    ML, CW
  );
  y += 3;
  const isCheque = data.modePaiement === "cheque";
  const isPrel   = !data.modePaiement || data.modePaiement === "prelevement";
  const isEsp    = data.modePaiement === "especes";
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);

  chk(ML, y);
  if (isCheque) { doc.setFont("helvetica", "bold"); doc.text("X", ML + 0.8, y); doc.setFont("helvetica", "normal"); }
  doc.text(isCheque && data.numeroCheque ? `Cheque n°: ${data.numeroCheque}` : "Cheque n°:..............................", ML + 5, y);

  chk(ML + 78, y);
  if (isPrel) { doc.setFont("helvetica", "bold"); doc.text("X", ML + 78.8, y); doc.setFont("helvetica", "normal"); }
  doc.text("Prélèvement", ML + 83, y);

  chk(ML + 115, y);
  if (isEsp) { doc.setFont("helvetica", "bold"); doc.text("X", ML + 115.8, y); doc.setFont("helvetica", "normal"); }
  doc.text("Espèces", ML + 120, y);
  y += 8;

  // Séparateur
  hline(y, ML, ML + CW, 0.5);
  y += 7;

  // Parties
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("Le présent contrat de location de matériel informatique est conclu entre les soussignés :", ML, y);
  y += 7;

  doc.text("Le Loueur", ML, y); y += 5;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(CO_NOM, ML, y); y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(CO_ADR1, ML, y); y += 5;
  doc.text(CO_CP_VIL, ML, y); y += 8;

  doc.text(
    `D'une part, et, le locataire (N° du contrat : C ${data.contractNumber || "..........)"})`,
    ML, y
  );
  y += 8;

  // Boîtes signature + adresse
  const bW = (CW - 6) / 2;
  const bH = 28;
  rect(ML, y, bW, bH, true);
  doc.setTextColor(150); doc.setFontSize(8);
  doc.text("Tampon & Signature", ML + 3, y + 6);
  doc.setTextColor(0);

  const b2x = ML + bW + 6;
  rect(b2x, y, bW, bH, true);
  doc.setFontSize(8.5);
  doc.text("Adresse :..............................................", b2x + 2, y + 6);
  hline(y + 14, b2x + 2, b2x + bW - 2, 0.2);
  hline(y + 20, b2x + 2, b2x + bW - 2, 0.2);
  hline(y + 26, b2x + 2, b2x + bW - 2, 0.2);
  y += bH + 6;

  chk(ML, y); doc.setFontSize(8.5);
  doc.text("Correspond à l'adresse de livraison du copieur", ML + 5, y);
  y += 8;

  doc.text("Le ......... / ....... /20.......", ML, y); y += 5;
  const repLabel = `Représentée par, M.${data.dirigeant ? " " + data.dirigeant : ""}`;
  doc.text(repLabel, ML, y);
  hline(y + 1, ML + doc.getTextWidth(repLabel), ML + CW, 0.2);
  y += 5;
  doc.text("D'autre part.", ML, y); y += 5;
  doc.text("Les partis présents ont convenu et arrêté ce qui suit :", ML, y);

  // ================================================================
  // PAGE 2 — CONDITIONS GÉNÉRALES
  // ================================================================
  doc.addPage();
  y = 15;

  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("Conditions générales de location", W / 2, y, { align: "center" });
  const tw = doc.getTextWidth("Conditions générales de location");
  hline(y + 1, W / 2 - tw / 2, W / 2 + tw / 2, 0.5);
  y += 12;

  articleTitle("Article 1 : Objet du contrat");
  txt(
    `Le présent contrat a pour objet de définir les conditions générales de location par le client du matériel de photocopie neuf ou d'occasion appartenant en pleine priorité à la société ${CO_MAJ}.`,
    ML, CW
  );

  articleTitle("Article 2 : Conditions de location");
  txt(
    `Avant toute location, le locataire devra signer ce contrat à remettre en main propre ou adressé par lettre recommandée avec accusé réception à l'adresse :\n${CO_NOM} - ${CO_ADR1} ${CO_CP_VIL}`,
    ML, CW
  );
  y += 1;
  txt(
    `Le déplacement et la transformation du matériel sont soumis à l'autorisation expresse et préalable du loueur. ${CO_MAJ} EST autorisé à vérifier sur place les conditions d'installation, d'utilisation et d'entretien du matériel.`,
    ML, CW
  );
  txt("Le matériel fourni en location n'est pas à l'état neuf, sauf énoncé contraire le précisant et doit être rendu dans les mêmes conditions de propreté et de bon état.", ML, CW);
  txt("La location est due, que le matériel a été utilisé ou non.", ML, CW);
  txt("Le matériel loué est inscessible et insaisissable.", ML, CW);
  txt("Le matériel rendu avec étiquettes ou autocollants, etc..., sera facturé selon le temps passé pour la remise en état (décollage des étiquettes et autocollants).", ML, CW);
  txt("En cas de livraison ou reprise de matériel, tout objet manquant qui entraînera un trajet supplémentaire sera facturé.", ML, CW);
  txt("Un inventaire sera effectué lors de la livraison et autre lors de la récupération. Afin d'éviter toute contestation, le client est prié d'y assister. En cas d'absence, aucune contestation ne pourra être admise ultérieurement.", ML, CW);
  txt("En cas de perte ou de casse, la facturation sera faite sur la base de la valeur du produit 3990€ à la date de la signature, et, le dépôt de garantie, ne sera pas restitué.", ML, CW);

  articleTitle("Article 3 : Modes de règlement");
  txt(
    `Toute commande ferme sera adressée et accompagnée d'une caution du montant de la valeur du matériel loué. L'acompte versé au départ sera déduite de votre dernière facture. (Notez que les historiques de paiements sont facturés 7,50€)`,
    ML, CW
  );
  txt("Dans un délai maximum de deux mois. La caution doit être versée soit en espèces, soit par chèque signé portant le nom du gérant ou (dans le cas d'un versement par chèque il doit être remis 31 jours à l'avance).", ML, CW);
  txt(
    `Toutes nos factures (envoyées par mail à la fin du mois) sont dues à réception : aucune réception de chèque n'est réputée constituer un paiement tant que ${CO_MAJ} n'a pas encaissé l'intégralité de la somme due. L'intégralité de la somme est due au premier jour de location.`,
    ML, CW
  );
  txt("Le défaut de règlement à son échéance entraînera la suspension du contrat de location, la mise hors service de ce matériel et une majoration de 25% du montant. Une pénalité de 10% sera additionnée tous les 7 jours.", ML, CW);
  txt(`En cas de non paiement, la société ${CO_MAJ} se réserve le droit de démonter ou de reprendre son matériel la valeur de l'acompte restant acquise à titre d'indemnité.`, ML, CW);
  txt(
    `Le paiement de la location s'effectue par prélèvement automatique sur votre compte, soumis à l'autorisation de votre banque, en virement, en chèque ou en espèces, à la date indiquée en 1ère page. Le client s'engage à respecter le mode de paiement choisi, en cas de RIB non fourni, chèque non encaissé ou virement non effectué, nous considérons que le client n'a pas respecté ses engagements, dans ce cas, ${CO_NOM} se réserve le droit de récupérer le matériel et le client devra régler l'intégralité des mensualités sur lesquelles il s'est engagé.`,
    ML, CW
  );
  txt("Il est du devoir du client de nous fournir le compteur chaque mois par mail ou par SMS au 20. Procédure fournie. Si le client ne fournit pas le compteur. Un prélèvement minimum de la mensualité sera effectué, et la différence restante sera débitée sur le mois suivant.", ML, CW);
  txt("Si votre contrat débute après ou avant le 20 / nous facturerons seulement le nombre de copies copier sur cette période.", ML, CW);
  txt("En accord avec l'article 1.112-6 les paiements sont limités à 1000€ entre particuliers depuis le 1er septembre 2015 (décret n° 2015-741) à défaut une pénalité d'une valeur de 10% du montant de la transaction vous sera taxé.", ML, CW);
  y += 3;

  // "Date de paiement de chaque mois :"
  checkPage(8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  const dpLabel = "Date de paiement de chaque mois :";
  doc.text(dpLabel, ML, y);
  hline(y + 0.8, ML, ML + doc.getTextWidth(dpLabel), 0.3);
  doc.setFont("helvetica", "normal");
  doc.text(" entre le 1 et le 5 de chaque mois.", ML + doc.getTextWidth(dpLabel), y);
  y += 6;

  txt(`Le client devra fournir à ${CO_NOM} un Relevé d'Identité Bancaire (RIB) pour effectuer les démarches de prélèvement automatique, si rejet des frais supplémentaires seront facturés dès la réception (25€ HT).`, ML, CW);
  txt("Les factures sont payables à réception, net, comptant, sans escompte.", ML, CW);
  y += 3;

  checkPage(8);
  doc.setFont("helvetica", "bolditalic"); doc.setFontSize(8.5);
  const siLabel = "Si le client ne règle pas ces dettes, il ne recevra aucune prestation";
  doc.text(siLabel, ML, y);
  hline(y + 0.8, ML, ML + doc.getTextWidth(siLabel), 0.3);
  y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);

  txt(
    `En accord avec L'article de loi : L131-35 sur les oppositions : Chèques) NON OPPOSABLE, et, ne peut être déclaré comme étant un chèque perdu, en cas d'incident, le gérant se pose obligatoirement garant, et s'engage, à rembourser la somme correspondante au montant du chèque.`,
    ML, CW
  );
  y += 3;

  checkPage(12);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  const interLabel = "• Interdiction de faire opposition à un prélèvement";
  doc.text(interLabel, ML + 3, y);
  hline(y + 0.8, ML + 3, ML + 3 + doc.getTextWidth(interLabel), 0.3);
  y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  txt("Il est interdit de faire opposition aux prélèvements émis par notre société. Nous nous gardons le droit de remettre le contrat à votre banque afin de savoir si votre demande est légitime. Dans le cas contraire nous nous gardons le droit d'entamer des procédures judiciaires afin de recouvrer le dû.", ML, CW);

  articleTitle("Article 4 : Assurances");
  txt(
    `Entre la période de livraison et de reprise, le matériel mis à la disposition du client est sous son entière responsabilité en cas de vol, porte ou dégradation. Il appartient donc au locataire de souscrire sa propre assurance en sa qualité de locataire exploitant, sa responsabilité étant engagée, tant à l'égard du public que du matériel qui lui est confié.`,
    ML, CW
  );

  // ================================================================
  // ARTICLES 5–10 (suite, peut déborder sur page 3 via checkPage)
  // ================================================================
  articleTitle("Article 5 : Obligations du locataire");
  txt(
    `Le locataire déclare connaître le fonctionnement du matériel loué. Il s'engage à utiliser le matériel dans des conditions normales en se conformant aux indications de ${CO_MAJ}. Le locataire devient, dès la mise à disposition du matériel et ceux jusqu'à sa restitution seul responsable de toute éventuelle détérioration, perte ou vol du matériel. En cas de refus de restituer la photocopieuse, ou si le client ne verse aucune mensualité, le matériel sera considéré comme vendu, et sera entièrement à vos frais. Il devra régler 3990€ pour le matériel + les frais de transport et les frais de récupération de la machine, s'élevant à 299€, il devra également rendre tous les cartons de papiers fournis depuis le départ ou les rembourser à hauteur de 18,90€ le carton (si fourni). Frais de livraison de papier gratuit à condition que le client arrive à la fin de la durée minimum d'engagement (5 ans) et qu'il n'est redevable d'aucune somme. Le client doit fournir le relevé compteur et doit être joignable par téléphone, en cas de déplacement, le relevé compteur, le client sera facturé 55€. Si le client veut résilier son contrat avant la date de l'engagement minimum signé sur le contrat (soit 5 ans) les mois seront additionnés et le client devra verser la différence en une fois avant l'enlèvement du photocopieur. Si votre situation n'est pas régularisée, la société ne vous remboursera pas le chèque de dépôt de garantie remis lors de la signature de ce contrat. En cas de vol, casse ou détérioration du photocopieur, la machine devra être intégralement remboursée à vos frais au prix de 3990€ (voir avec votre assureur pour les modalités de remboursement).`,
    ML, CW
  );
  txt("Incidents de paiement : En cas de rejet sur le 1er mois, la 1ère mensualité sera automatiquement reporté sur le 2ème mois, 2ème rejet, sans retour positif de votre part afin de régulariser votre situation votre dossier sera transmis au contentieux.", ML, CW);
  txt(`Pendant toute la durée du présent contrat (5 ans), le locataire s'engage à ne pas passer de machine concurrence ou dont il serait le propriétaire au sein de ses locaux. Il s'engage en cas de nécessité d'une deuxième machine, à s'adresser à ${CO_NOM} pour en obtenir une deuxième.`, ML, CW);
  txt(`Toutes ces conditions sont fixées afin d'amortir les frais de prestation de la société ${CO_NOM}.`, ML, CW);

  articleTitle("Article 6 : Responsabilité du loueur");
  txt(`En aucun cas ${CO_MAJ} ne pourra être tenu responsable de tout dommage de quelque nature que ce soit, notamment perte d'exploitation, perte de données, ou toute autre perte résultant de l'utilisation ou de l'impossibilité d'utiliser le matériel loué.`, ML, CW);
  txt("La maintenance du système d'exploitation et des logiciels sont à la charge du client. (Sauf contrat de maintenance)", ML, CW);
  txt(`La maintenance est uniquement matérielle et s'effectuera soit sur le lieu d'exploitation soit au sein de ${CO_MAJ}. ${CO_MAJ} s'engage à réparer le matériel ou à le remplacer par un matériel équivalent. En cas de casse du matériel, pièces, ou autres, les frais encourus seront à la charge du client (signataire).`, ML, CW);
  txt("En cas de pannes, veuillez joindre uniquement le 01.55.99.00.69 et décrire précisément la panne, si la/les panne(s) n'est pas justifiée et que cela engendre un déplacement inutile il sera facturé 55€, valable aussi pour un déplacement inutile concernant les paiements.", ML, CW);
  txt("En cas de présence de PC loué ou vendu lié à ce contrat :", ML, CW);
  txt("Les interventions sont limitées à 3 par an. Si le système Windows sera verrouillé par un système de réinitialisation à chaque redémarrage afin d'évitée toute panne. Nous considérons que ce pc est fourni ou vendu juste pour l'impression. Nous ne prendrons aucune responsabilité si le client l'utilise pour d'autre besoins.", ML, CW);
  txt("La maintenance de PC comprend la maintenance ou le remplacement standard de PC sur site.", ML, CW);
  txt("Une garantie de la durée du contrat (5 ans) porte sur les PC.", ML, CW);
  y += 4;
  checkPage(14);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("UC : ___________________________ N° série : _________________", ML, y); y += 5;
  doc.text("Ecran : _________________________ N° série : _________________", ML, y); y += 5;

  articleTitle("Article 7 : Modification de date/paiement :");
  txt("Toute modification des dates programmées doit être annoncée avant le déplacement du technicien. À défaut de ce préavis, un montant de 30% de la prestation sera dû.", ML, CW);
  txt(`En cas d'annulation de la location la caution sera transformée en indemnité d'annulation, il sera conservé par ${CO_MAJ}.`, ML, CW);
  txt(`En cas de modification concernant le mode de règlement, il faudra impérativement nous faire parvenir un recommandé stipulant le nouveau mode de règlement, le changement sera effectif après un mois à partir de la date de réception du courrier recommandé. En cas d'impayé, si votre dette atteint la somme de 1000€ un recommandé vous sera envoyé au 2ème mois, et le 3ème mois le dossier sera transmis au contentieux, il y aura également des majorations par semaine de retard. Les prix indiqués sur nos contrats seront respectés. Sauf cas de crise économique ou hausse des prix des matériaux fournis. Dans ce cas vous serez contacté par nos commerciaux et nous vous enverrons un mail ou courrier en liens.`, ML, CW);

  articleTitle("Article 9 : Propriété");
  checkPage(8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Le matériel", ML, y);
  doc.setFont("helvetica", "normal");
  const matW = doc.getTextWidth("Le matériel");
  const matRest = ` loué reste la propriété entière et exclusive de ${CO_MAJ} et ne peut en aucun cas faire l'objet de déplacement ou de cession quelconque. Le locataire doit faire respecter ce droit de propriété en toute occasion par tous moyens et à ses frais. A savoir qu'une copie imprimée en A3 et est comptée comme étant 2 copies A4.`;
  const matLines = doc.splitTextToSize(matRest, CW - matW);
  matLines.forEach((l, i) => {
    checkPage(5);
    doc.text(l, i === 0 ? ML + matW : ML, y);
    y += 4.8;
  });

  checkPage(8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Le locataire", ML, y);
  doc.setFont("helvetica", "normal");
  const locW = doc.getTextWidth("Le locataire");
  const locRest = " s'engage à préserver pendant toute la durée de location les sigles de l'entreprise apposés sur les différents éléments du matériel loué, dont les mentions devront demeurer lisibles et apparentes.";
  const locLines = doc.splitTextToSize(locRest, CW - locW);
  locLines.forEach((l, i) => {
    checkPage(5);
    doc.text(l, i === 0 ? ML + locW : ML, y);
    y += 4.8;
  });

  checkPage(8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Le prêt", ML, y);
  doc.setFont("helvetica", "normal");
  const pretW = doc.getTextWidth("Le prêt");
  const pretRest = `, la sous-location ou toute cession des droits que bénéficie le locataire au titre du contrat, sont subordonnées à l'autorisation préalable et écrite de ${CO_MAJ} et ne pourraient modifier les obligations du locataire à son égard. `;
  const pretLines = doc.splitTextToSize(pretRest, CW - pretW);
  pretLines.forEach((l, i) => {
    checkPage(5);
    doc.text(l, i === 0 ? ML + pretW : ML, y);
    y += 4.8;
  });
  checkPage(6);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Engagement sur 60 mois.", ML, y);
  y += 7;

  articleTitle("Article 10 : Clause particulière");
  txt(`Le client autorise ${CO_MAJ} à consulter les organismes de crédit et les banques de données financières pour fin de référence.`, ML, CW);
  y += 5;

  // --- Matériel loué ---
  checkPage(45);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("matériel loué :", ML, y); y += 5;
  doc.text("PHOTOCOPIEUR", ML, y); y += 5;
  doc.setFontSize(8.5);
  doc.text(`Marque : ${data.marque || "RICOH"}`, ML, y); y += 5;

  // Checkboxes modèles — cocher le modèle sélectionné
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("Model :", ML, y);
  const models = ["MP C3002/C3502", "MP C3003/C3503", "MP C3004/C3504", "......."];
  let mx = ML + 18;
  models.forEach((m) => {
    chk(mx, y);
    if (data.modele && (data.modele === m || (m === "......." && data.modele === "Autre"))) {
      doc.setFont("helvetica", "bold"); doc.text("X", mx + 0.8, y); doc.setFont("helvetica", "normal");
    }
    doc.text(m, mx + 5, y); mx += 46;
  });
  y += 6;

  doc.text(`N°Série : ${data.numeroSerie || "...................................................."}`, ML, y); y += 5;
  doc.setFont("helvetica", "italic");
  doc.text("Feuille de relevé c", ML, y); y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Relevé compteur lors de la livraison :", ML, y); y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Noir & blanc : ${data.compteurNB || "0"}`, ML, y);
  doc.text(`Couleur : ${data.compteurCouleur || "0"}`, ML + 80, y);
  y += 6;
  doc.setFont("helvetica", "italic"); doc.setFontSize(7.5);
  txt("Valable aussi : l'impression de la fiche compteur depuis la machine fournissant le numéro de série et le compteur à conserver avec le contrat", ML, CW);

  // ================================================================
  // PAGE 4 — INFOS VENTE CLIENTS FINAL
  // ================================================================
  doc.addPage();
  y = 15;

  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("INFOS VENTE CLIENTS FINAL :", ML, y);
  hline(y + 0.8, ML, ML + doc.getTextWidth("INFOS VENTE CLIENTS FINAL :"), 0.4);
  y += 7;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(`Responsable Boutique : ${data.responsableBoutique || "......................................................................."}`, ML, y); y += 5;
  doc.text(`Téléphone Portable : ${data.telephoneResponsable || "........................................................................"}`, ML, y); y += 10;

  // Tableau horaires
  const tH = 7;
  const cW0 = 26, cW1 = 22, cW2 = 22, cW3 = 22, cW4 = 22, cW5 = 20;
  const totalTW = cW0 + cW1 + cW2 + cW3 + cW4 + cW5;

  // En-tête tableau
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Horaire", ML + 2, y + 5);
  doc.text("Matin", ML + cW0 + (cW1 + cW2) / 2, y + 5, { align: "center" });
  doc.text("Après-Midi", ML + cW0 + cW1 + cW2 + (cW3 + cW4) / 2, y + 5, { align: "center" });
  doc.text("Fermée", ML + cW0 + cW1 + cW2 + cW3 + cW4 + 2, y + 5);
  hline(y, ML, ML + totalTW, 0.3);
  hline(y + tH, ML, ML + totalTW, 0.3);
  const tTopY = y;
  y += tH;

  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  let horaireData = {};
  try { horaireData = JSON.parse(data.horaires || "{}"); } catch (_) {}
  const fmtH = (v) => v ? v.replace(":", "h") : ".........h..........";

  jours.forEach((jour) => {
    const hj = horaireData[jour.toLowerCase()] || {};
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
    doc.text(jour, ML + 2, y + 5);
    doc.setFont("helvetica", "normal");
    doc.text(fmtH(hj.md), ML + cW0 + 2, y + 5);
    doc.text(fmtH(hj.mf), ML + cW0 + cW1 + 2, y + 5);
    doc.text(fmtH(hj.ad), ML + cW0 + cW1 + cW2 + 2, y + 5);
    doc.text(fmtH(hj.af), ML + cW0 + cW1 + cW2 + cW3 + 2, y + 5);
    doc.rect(ML + cW0 + cW1 + cW2 + cW3 + cW4 + 3, y + 2, 4, 4);
    if (hj.f) { doc.setFont("helvetica", "bold"); doc.text("X", ML + cW0 + cW1 + cW2 + cW3 + cW4 + 4, y + 5.5); doc.setFont("helvetica", "normal"); }
    y += tH;
    hline(y, ML, ML + totalTW, 0.2);
  });

  // Lignes verticales
  doc.setLineWidth(0.2);
  const vCols = [0, cW0, cW0+cW1, cW0+cW1+cW2, cW0+cW1+cW2+cW3, cW0+cW1+cW2+cW3+cW4, totalTW];
  vCols.forEach((offset) => {
    doc.line(ML + offset, tTopY, ML + offset, y);
  });
  y += 8;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(`Téléphone Portable : ${data.telephone || ".........................................."}`, ML, y);
  doc.text(`Téléphone fixe : ${(data.telephone2 && data.telephone2 !== "-") ? data.telephone2 : "..........................................."}`, ML + 85, y);
  y += 5;
  doc.text(`Mail : ${data.email || "......................................................................................................................"}`, ML, y);
  y += 8;

  // Tarifs client final
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Tarifs Client final", ML, y); y += 5;
  doc.setFont("helvetica", "normal");

  const hasVal = (v) => v && !isNaN(parseFloat(v)) && parseFloat(v) !== 0;
  const fmtTarif = (v) => hasVal(v) ? `${v} \u20ac` : "......................\u20ac";
  // Fixed column positions for tarif rows
  const COL1_LABEL = ML + 8;   // label start (after bullet)
  const COL1_VAL   = ML + 82;  // value right-aligned end of col 1
  const COL2_LABEL = ML + 88;  // second label start
  const COL2_VAL   = ML + CW;  // second value right-aligned
  const tarifRow = (label, val1, label2, val2) => {
    // Draw small filled square bullet
    doc.setFillColor(0);
    doc.rect(ML + 3, y - 3, 2.5, 2.5, "F");
    doc.text(label, COL1_LABEL, y);
    doc.text(fmtTarif(val1), COL1_VAL, y, { align: "right" });
    if (label2) {
      doc.text(label2, COL2_LABEL, y);
      doc.text(fmtTarif(val2), COL2_VAL, y, { align: "right" });
    }
    y += 6;
  };
  tarifRow("Tarif copie N&B", data.tarifCopieNB, "Couleur", data.tarifCopieCouleur);
  tarifRow("Tarif impression : N&B", data.tarifImpressionNB, "Couleur", data.tarifImpressionCouleur);
  tarifRow("Tarif Scan", data.tarifScan, "Fax", data.tarifFax);
  y += 4;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text(`Comment avez-vous connu la société ${CO_MAJ} ?`, ML, y);
  y += 5;
  if (data.parrain) {
    doc.setFont("helvetica", "normal");
    doc.text(String(data.parrain), ML, y); y += 5;
  }
  hline(y, ML, ML + CW, 0.2); y += 5;
  hline(y, ML, ML + CW, 0.2); y += 10;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(`Matériel appartenant à la société : ${CO_NOM},`, ML, y); y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Fait en double exemplaires original :", ML, y);
  hline(y + 0.8, ML, ML + doc.getTextWidth("Fait en double exemplaires original :"), 0.4);
  y += 8;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("Le ...... /......../20......", ML, y); y += 5;
  const pourLabel = `Pour ${CO_NOM}, M. `;
  doc.text(pourLabel, ML, y);
  hline(y + 0.8, ML + doc.getTextWidth(pourLabel), ML + CW, 0.2);
  y += 5;
  doc.text("Gérant et représentant légal.", ML, y); y += 5;
  doc.text("En signant ce document, vous attestez avoir pris connaissance de nos conditions.", ML, y);
  y += 10;

  // Boîtes finales
  checkPage(40);
  const fsW = 68, fsH = 36;
  rect(ML, y, fsW, fsH, true);
  doc.setTextColor(150); doc.setFontSize(8);
  doc.text("Tampon & Signature:", ML + 3, y + 6);
  doc.setTextColor(0);

  const rx = ML + fsW + 10;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Numéro SIRET :", rx, y + 6);
  if (data.siret) { doc.setFont("helvetica", "normal"); doc.text(String(data.siret), rx, y + 11); }
  hline(y + 12, rx, rx + 80, 0.4);
  doc.setFont("helvetica", "bold");
  doc.text("Numéro TVA intracommunautaire :", rx, y + 18);
  if (data.tva) { doc.setFont("helvetica", "normal"); doc.text(String(data.tva), rx, y + 23); }
  hline(y + 24, rx, rx + 80, 0.4);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  const bpaLines = doc.splitTextToSize(`Faire précéder votre signature de la date et de la mention "bon pour accord"`, 78);
  bpaLines.forEach((l, i) => doc.text(l, rx, y + 29 + i * 4));
  hline(y + fsH - 1, rx, rx + 80, 0.4);

  // ================================================================
  // PAGE 5 — MANDAT SEPA
  // ================================================================
  doc.addPage();
  y = 15;

  rect(ML + 15, y, CW - 30, 13);
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("MANDAT DE PRELEVEMENT SEPA", W / 2, y + 9, { align: "center" });
  y += 20;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  txt("Ce document est à compléter et à renvoyer daté et signé et tamponné accompagné d'un RIB comportant", ML, CW);
  txt("Les mentions BIC – IBAN à l'adresse suivante", ML, CW);
  y += 5;

  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text(CO_NOM, ML, y); y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(CO_ADR1, ML, y); y += 5;
  doc.text(CO_CP_VIL, ML, y); y += 5;
  doc.text(`Siret : ${CO_SIRET}`, ML, y); y += 8;

  doc.text("Intitulé de compte :", ML, y); y += 5;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("Mandat de prélèvement SEPA", ML, y); y += 7;

  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  const sepaAuthLines = doc.splitTextToSize(
    `En signant ce formulaire de mandat, vous autorisez la société ${CO_NOM} à envoyer des instructions à votre banque pour débiter votre compte, et votre banque à débiter votre compte conformément aux instructions de ${CO_NOM}`,
    CW
  );
  sepaAuthLines.forEach((l) => { doc.text(l, ML, y); y += 4.8; });
  y += 5;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("Référence Unique Mandat : RUM", ML, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text("(Réservé au créancier)", ML + doc.getTextWidth("Référence Unique Mandat : RUM "), y);
  y += 10;

  // Deux boîtes SEPA
  const sBoxW = (CW - 5) / 2;
  const sBoxH = 52;
  rect(ML, y, sBoxW, sBoxH);
  let cy = y + 8;
  const sepaFields = [
    ["*Raison Social", data.raisonSociale],
    ["*Nom", data.dirigeant],
    ["*Prénom", ""],
    ["*Adresse", data.adresse],
    ["Code postal", data.codePostal],
    ["Ville", data.ville],
  ];
  doc.setFontSize(8.5);
  sepaFields.forEach(([label, val]) => {
    doc.setFont("helvetica", "normal");
    const lbl = `${label} : `;
    doc.text(lbl, ML + 3, cy);
    if (val) {
      doc.setFont("helvetica", "bold");
      doc.text(String(val), ML + 3 + doc.getTextWidth(lbl), cy);
    } else {
      hline(cy + 1, ML + 3 + doc.getTextWidth(lbl), ML + sBoxW - 3, 0.3);
    }
    cy += 7.5;
  });

  const sBox2x = ML + sBoxW + 5;
  rect(sBox2x, y, sBoxW, sBoxH);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("Identifiant Créancier SEPA :", sBox2x + 3, y + 7);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(CO_NOM, sBox2x + 3, y + 15);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(CO_ADR1, sBox2x + 3, y + 22);
  doc.text(CO_CP_VIL, sBox2x + 3, y + 28);
  y += sBoxH + 8;

  // IBAN
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("IBAN", ML, y); y += 5;
  let ibx = ML;
  doc.setLineWidth(0.3);
  const cleanIban = String(data.iban || "").replace(/\s/g, "").toUpperCase();
  // FR box
  doc.rect(ibx, y - 4, 6, 6);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text(cleanIban[0] || "F", ibx + 1.2, y); ibx += 7;
  doc.rect(ibx, y - 4, 6, 6);
  doc.text(cleanIban[1] || "R", ibx + 1.2, y); ibx += 10;
  // 7 groupes de 4
  for (let g = 0; g < 7; g++) {
    const chunk = cleanIban.slice(2 + g * 4, 6 + g * 4);
    doc.rect(ibx, y - 4, 18, 6);
    if (chunk) doc.text(chunk, ibx + 1.5, y);
    ibx += 21;
  }
  // dernier groupe 3
  const lastChunk = cleanIban.slice(30, 33);
  doc.rect(ibx, y - 4, 13, 6);
  if (lastChunk) doc.text(lastChunk, ibx + 1.5, y);
  doc.setFontSize(8.5);
  y += 12;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
  doc.text("BIC", ML, y); y += 5;
  rect(ML, y - 4, 42, 8);
  if (data.bic) { doc.setFont("helvetica", "normal"); doc.text(String(data.bic).toUpperCase(), ML + 2, y); }
  y += 13;

  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
  doc.text(
    "Veuillez compléter tous les champs (*) du mandat, joindre un RIB ou RICE, puis adresser l'ensemble au créancier",
    W / 2, y, { align: "center" }
  );
  y += 10;

  doc.setFontSize(8.5);
  doc.text("Le ......./......./20.......", ML, y);
  doc.text("A : ...........................................", ML, y + 6);

  const sfX = ML + 75;
  const sfW = CW - 75;
  const sfH = 36;
  rect(sfX, y - 3, sfW, sfH, true);
  doc.setTextColor(150); doc.setFontSize(8);
  doc.text("Tampon & Signature", sfX + 4, y + 5);
  doc.setTextColor(0);

  // ================================================================
  // NUMÉROS DE PAGES (toutes les pages)
  // ================================================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(String(p), W / 2, H - 8, { align: "center" });
    doc.setTextColor(0);
  }

  const safeCode = String(data.codeInterne || "C00000").replace(/[^\w-]/g, "");
  doc.save(`Contrat_${safeCode}.pdf`);
  return true;
};
