// public/js/views/hematologyCare.js
// HarborPath - Hematology, Coagulopathy & Toxic Hemolysis Navigator
// Clinical Consensus: American Society of Hematology (ASH) Guidelines on TTP/TMA & Anticoagulation Reversal,
// ACMT / CDC Clinical Advisories on Brodifacoum ("Superwarfarin") Adulterated Synthetic Cannabinoids & Levamisole Cocaine Vasculitis,
// AASLD / AGA Clinical Practice Update on Coagulopathy & Procedural Bleeding Management in Cirrhosis ("Rebalanced Hemostasis"),
// FDA / ACMT Consensus on Oxidant Methemoglobinemia, Heinz Body Hemolytic Anemia & Methylene Blue Contraindication in G6PD Deficiency.
// Privacy Invariant: 100% ephemeral in-RAM state, zero device storage, zero PII.

import { h, clear, icon, copyText, syncTablists, wireTablistKeyboard } from '../dom.js';
import { getLang } from '../i18n.js';

// ============================================================================
// CLINICAL TAXONOMY: SUBSTANCE-INDUCED HEMATOLOGIC & COAGULOPATHIC SYNDROMES
// ============================================================================

export const HEMATOLOGY_SYNDROME_PROFILES = Object.freeze({
  levamisoleVasculitis: Object.freeze({
    id: 'levamisole_vasculitis',
    nameEn: 'Levamisole-Adulterated Cocaine ANCA Vasculitis, Retiform Purpura & Severe Agranulocytosis',
    nameEs: 'Vasculitis ANCA por Cocaína Adulterada con Levamisol, Púrpura Retiforme y Agranulocitosis Grave',
    pathophysiologyEn: 'Levamisole (a veterinary imidazothiazole anthelmintic and immunomodulator used to cut ~70–80% of illicit cocaine because it potentiates nicotinic acetylcholine receptors and metabolizes into aminorex, an amphetamine-like stimulant) acts as a reactive hapten on neutrophil surfaces. It induces dual positivity for perinuclear ANCA (p-ANCA / anti-MPO) and cytoplasmic ANCA (c-ANCA / anti-PR3), antibodies against human neutrophil elastase (HNE), antiphospholipid/lupus anticoagulant antibodies, immune-complex leukocytoclastic and thrombotic small-vessel vasculopathy, and T-cell-mediated bone marrow myeloid maturation arrest.',
    pathophysiologyEs: 'El levamisol (antihelmíntico veterinario usado para adulterar el 70–80 % de la cocaína ilícita porque potencia los receptores nicotínicos y se metaboliza en aminorex) actúa como hapteno sobre los neutrófilos. Induce positividad dual para p-ANCA (anti-MPO) y c-ANCA (anti-PR3), anticuerpos contra la elastasa de neutrófilos humanos (HNE), vasculopatía trombótica y leucocitoclástica de pequeño vaso, y detención de la maduración mieloide en la médula ósea.',
    clinicalPresentationEn: 'PATHOGNOMONIC AURICULAR RETIFORM PURPURA & AGRANULOCYTOSIS: Classic painful, stellate, violaceous retiform (net-like) purpura with necrotic black eschars and erythematous borders preferentially involving the bilateral earlobes (auricular helices), malar cheeks, tip of the nose, and lower extremities. Up to 60% of patients develop severe neutropenia or profound agranulocytosis (Absolute Neutrophil Count [ANC] < 500/mcL), presenting with high fever, exudative pharyngitis, oral ulcers, or neutropenic sepsis. MANAGEMENT: Immediate cessation of cocaine/levamisole exposure is the cornerstone of therapy (cutaneous lesions typically resolve spontaneously within 2–3 weeks without toxic systemic cyclophosphamide/rituximab). For Neutropenic Fever (ANC < 500/mcL + Temp >= 38.3°C), obtain stat blood cultures, initiate empiric IV antipseudomonal beta-lactam therapy (Cefepime 2 g IV q8h or Piperacillin-Tazobactam 4.5 g IV q6h) within 60 minutes, and administer Filgrastim (G-CSF 5 mcg/kg/day SC).',
    clinicalPresentationEs: 'PÚRPURA RETIFORME AURICULAR PATOGNOMÓNICA Y AGRANULOCITOSIS: Púrpura retiforme (en red) violácea y dolorosa con necrosis central negruzca que afecta característicamente a ambos lóbulos y hélices de las orejas, mejillas, punta nasal y extremidades. Hasta el 60 % desarrolla neutropenia grave o agranulocitosis profunda (Recuento Absoluto de Neutrófilos [RAN] < 500/mcL) con fiebre alta, faringitis, úlceras orales y sepsis neutropénica. MANEJO: Suspensión inmediata de cocaína/levamisol (las lesiones cutáneas suelen resolverse en 2–3 semanas sin inmunosupresores citotóxicos). Ante Fiebre Neutropénica (RAN < 500/mcL + Temp >= 38,3 °C), extraer hemocultivos e iniciar betalactámico antipseudomónico IV (Cefepima o Piperacilina-Tazobactam) en menos de 60 minutos más Filgrastim (G-CSF 5 mcg/kg/día).',
  }),

  brodifacoumSuperwarfarin: Object.freeze({
    id: 'brodifacoum_superwarfarin',
    nameEn: 'Brodifacoum ("Superwarfarin") Adulterated Synthetic Cannabinoids ("K2 / Spice") Coagulopathy',
    nameEs: 'Coagulopatía por Brodifacoum ("Superwarfarina") en Cannabinoides Sintéticos ("K2 / Spice")',
    pathophysiologyEn: 'Illicit synthetic cannabinoid receptor agonists ("K2", "Spice") have repeatedly been adulterated with long-acting anticoagulant rodenticides (LAARs)—principally Brodifacoum, Difenacoum, and Bromadiolone—added to prolong psychotropic lipid retention. Brodifacoum inhibits hepatic Vitamin K Epoxide Reductase Complex 1 (VKORC1) with 100-fold greater potency than warfarin, completely halting gamma-carboxylation of Vitamin K-dependent coagulation factors II, VII, IX, and X as well as Proteins C and S. Due to extreme lipophilicity and hepatic enterohepatic recirculation, brodifacoum exhibits a biological terminal half-life of 20 to 60+ days.',
    pathophysiologyEs: 'Los cannabinoides sintéticos ilícitos ("K2", "Spice") han sido adulterados con rodenticidas anticoagulantes de acción prolongada (LAAR), principalmente Brodifacoum y Difenacoum. El brodifacoum inhibe la enzima hepática VKORC1 con una potencia 100 veces superior a la warfarina, agotando los factores dependientes de vitamina K (II, VII, IX y X). Por su extrema lipofilia hepática, tiene una vida media terminal de 20 a más de 60 días.',
    clinicalPresentationEn: 'CLINICAL HALLMARK: Unexplained spontaneous gross hematuria (flank pain with bright red urine), intractable epistaxis, gingival bleeding, diffuse ecchymoses, gastrointestinal hemorrhage, or intracranial hemorrhage within days to weeks of smoking synthetic cannabinoids. Labs reveal an astronomically elevated PT/INR (often INR > 10 to > 20) and prolonged aPTT that corrects on a 1:1 mixing study, with normal platelets and fibrinogen. ACUTE REVERSAL & THE REBOUND TRAP: For life-threatening hemorrhage, administer 4-Factor Prothrombin Complex Concentrate (4F-PCC / Kcentra 25–50 units/kg IV) PLUS Vitamin K1 (Phytonadione) 10 mg slow IV infusion. CARDINAL MAINTENANCE RULE: Because brodifacoum persists in the liver for months while 4F-PCC and FFP factors decay within 12–24 hours, patients require MASSIVE HIGH-DOSE ORAL VITAMIN K1 (Phytonadione 50–100 mg PO daily in divided doses q6–8h) continuously for 3 to 6+ months until serum brodifacoum levels fall below 10 ng/mL! Never use Vitamin K3 (menadione), which is ineffective and causes oxidative hemolysis.',
    clinicalPresentationEs: 'CUADRO CLÍNICO: Hematuria macroscópica espontánea inexplicable, epistaxis incoercible, gingivorragia, equimosis, hemorragia digestiva o intracraneal tras fumar cannabinoides sintéticos, con TP/INR extremadamente prolongado (INR > 10) que corrige en estudio de mezcla 1:1, plaquetas y fibrinógeno normales. REVERSIÓN AGUDA Y TRAMPA DE REBOTE: En sangrado grave, administrar Concentrado de Complejo Protrombínico de 4 Factores (4F-PCC / Kcentra 25–50 U/kg IV) MÁS Vitamina K1 (Fitomenadiona) 10 mg IV lenta. REGLA DE MANTENIMIENTO CARDINAL: Como el brodifacoum persiste meses en el hígado mientras los factores del PCC/PFC duran solo 12–24 h, el paciente requiere VITAMINA K1 ORAL EN DOSIS MASIVAS (Fitomenadiona 50–100 mg VO al día divididos cada 6–8 h) durante 3 a 6+ meses para evitar hemorragia mortal de rebote.',
  }),

  oxidantHemolysisG6pd: Object.freeze({
    id: 'oxidant_hemolysis_g6pd',
    nameEn: 'Oxidant Drug Hemolysis, Methemoglobinemia & The G6PD Methylene Blue Contraindication Trap',
    nameEs: 'Hemólisis Oxidativa, Metahemoglobinemia y la Trampa Mortal del Azul de Metileno en Déficit de G6PD',
    pathophysiologyEn: 'Potent oxidant drugs and inhalants—volatile alkyl nitrites ("Poppers": amyl, isobutyl, or isopropyl nitrite), phenazopyridine (OTC urinary analgesic), dapsone (frequently used as a cutting agent or prophylaxis), topical benzocaine, and naphthalene—simultaneously oxidize hemoglobin iron from ferrous (Fe2+) to ferric Methemoglobin (Fe3+, incapable of binding oxygen and shifting the oxygen-hemoglobin dissociation curve to the left) AND oxidize erythrocyte sulfhydryl groups, precipitating denatured globin chains as insoluble Heinz bodies. Splenic cords strip Heinz bodies from RBC membranes, creating characteristic "bite cells" (degmacytes) and blister cells.',
    pathophysiologyEs: 'Sustancias oxidantes—nitritos de alquilo inhalados ("Poppers": nitrito de amilo o isobutilo), fenazopiridina, dapsona y benzocaína—oxidan simultáneamente el hierro de la hemoglobina de ferroso (Fe2+) a férrico o Metahemoglobina (Fe3+, incapaz de transportar oxígeno) Y desnaturalizan las cadenas de globina formando cuerpos de Heinz insolubles. El bazo arranca estos precipitados, generando "células mordidas" (bite cells) y células en ampolla.',
    clinicalPresentationEn: 'SATURATION GAP & BITE CELL HEMOLYSIS: Central slate-gray cyanosis unresponsive to 100% oxygen, "chocolate-brown" arterial blood, and a classic pulse oximetry "saturation gap" (SpO2 clamped near 85% despite arterial PaO2 > 100 mmHg on ABG, confirmed by CO-oximetry MetHb >= 15–30%), followed 24–72 hours later by acute intravascular/extravascular hemolysis (dark tea/cola hemoglobinuria, jaundice, elevated LDH, undetectable haptoglobin). CARDINAL DEADLY TRAP — METHYLENE BLUE IN G6PD DEFICIENCY: Standard antidote Methylene Blue (1–2 mg/kg IV over 5 min) is an oxidant dye that requires NADPH generated by Glucose-6-Phosphate Dehydrogenase (G6PD) via the hexose monophosphate shunt to be reduced into active leukomethylene blue. In patients with known or suspected G6PD deficiency, Methylene Blue is ABSOLUTELY CONTRAINDICATED: it completely fails to reduce methemoglobin and instead triggers fulminant, fatal intravascular hemolysis! Treat G6PD-deficient methemoglobinemia with High-Dose IV Ascorbic Acid (Vitamin C 1.5–2 g IV q6h) and/or emergent RBC exchange transfusion.',
    clinicalPresentationEs: 'BRECHA DE SATURACIÓN Y HEMÓLISIS: Cianosis central gris pizarra refractaria al oxígeno al 100 %, sangre arterial color "chocolate" y brecha de saturación clásica (SpO2 fija cerca del 85 % pese a PaO2 > 100 mmHg en gasometría, confirmada por CO-oximetría), seguida a las 24–72 h de hemólisis aguda (hemoglobinuria oscura, ictericia, LDH elevada, haptoglobina indetectable). TRAMPA MORTAL — AZUL DE METILENO EN DÉFICit DE G6PD: El Azul de Metileno (1–2 mg/kg IV) necesita NADPH producido por la enzima G6PD para convertirse en leucometileno activo. ¡En pacientes con déficit de G6PD conocido o sospechado, el Azul de Metileno está ABSOLUTAMENTE CONTRAINDICADO porque no reduce la metahemoglobina y desencadena una hemólisis intravascular masiva y letal! En déficit de G6PD, usar Ácido Ascórbico IV en altas dosis (Vitamina C 1,5–2 g IV cada 6 h) o exanguinotransfusión.',
  }),

  drugInducedTma: Object.freeze({
    id: 'drug_induced_tma',
    nameEn: 'IV Polymer-Tablet & Quinine Thrombotic Microangiopathy (TMA / TTP-HUS Syndrome)',
    nameEs: 'Microangiopatía Trombótica (MAT / PTT-SHU) por Inyección de Polímeros de Opioides y Quinina',
    pathophysiologyEn: 'Intravenous injection of dissolved abuse-deterrent extended-release opioid tablets containing high-molecular-weight polyethylene oxide (PEO, e.g., reformulated Opana ER oxymorphone) causes direct dose-dependent microvascular endothelial toxicity, retinal and renal glomerular capillary occlusion, and platelet-fibrin microthrombi without ADAMTS13 deficiency. Separately, heroin or cocaine cut with Quinine induces quinine-dependent IgG/IgM autoantibodies targeting platelet glycoprotein Ib/IX or IIb/IIIa and renal endothelial cells, triggering immune-mediated Drug-Induced Thrombotic Microangiopathy (DITMA).',
    pathophysiologyEs: 'La inyección intravenosa de comprimidos de liberación prolongada disueltos que contienen óxido de polietileno (PEO) de alto peso molecular provoca toxicidad endotelial microvascular directa y microtrombos de plaquetas y fibrina. Por otro lado, la heroína o cocaína adulterada con Quinina induce anticuerpos dependientes de quinina contra las glicoproteínas plaquetarias y el endotelio renal, desencadenando una Microangiopatía Trombótica Inducida por Fármacos (MAT-F).',
    clinicalPresentationEn: 'CLASSIC TMA TRIAD: 1) Microangiopathic Hemolytic Anemia (MAHA: Coombs-negative hemolysis, LDH >> 500 U/L, indirect hyperbilirubinemia, undetectable haptoglobin, and >= 2–3 schistocytes [helmet cells/triangular RBC fragments] per high-power field on peripheral blood smear); 2) Severe Thrombocytopenia (platelets typically < 20,000–30,000/mcL with petechiae/purpura); and 3) Acute Kidney Injury (oliguria, hematuria, proteinuria) or fluctuating neurologic ischemia. DIAGNOSTIC & THERAPEUTIC PROTOCOL: Calculate the PLASMIC score and draw ADAMTS13 activity and inhibitor levels BEFORE administering any plasma product. While PEO/Quinine DITMA typically exhibits preserved ADAMTS13 activity (> 10%) and resolves with drug cessation and supportive care, if the PLASMIC score is >= 5 or autoimmune TTP (ADAMTS13 < 10%) cannot be excluded, initiate emergent Therapeutic Plasma Exchange (PLEX) + high-dose methylprednisolone immediately. STRICT PLATELET RULE: Avoid routine prophylactic platelet transfusions in suspected TTP/TMA unless life-threatening hemorrhage is present.',
    clinicalPresentationEs: 'TRÍADA CLÁSICA DE MAT: 1) Anemia Hemolítica Microangiopática (AHMA: Coombs negativo, LDH muy elevada, haptoglobina indetectable y >= 2–3 esquistocitos [hematíes fragmentados en casco] por campo en el frotis); 2) Trombocitopenia grave (plaquetas < 20.000–30.000/mcL con petequias); y 3) Lesión Renal Aguda o síntomas neurológicos. PROTOCOLO DIAGNÓSTICO Y TERAPÉUTICO: Calcular puntuación PLASMIC y extraer nivel de actividad de ADAMTS13 ANTES de transfundir plasma. Si la puntuación PLASMIC es >= 5 o no puede descartarse PTT autoinmune (ADAMTS13 < 10 %), iniciar Recambio Plasmático Terapéutico (plasmaféresis / PLEX) urgente más corticoides. REGLA DE PLAQUETAS: Evitar transfusiones profilácticas de plaquetas en sospecha de PTT/MAT salvo hemorragia vital.',
  }),

  alcoholMarrowZieve: Object.freeze({
    id: 'alcohol_marrow_zieve',
    nameEn: 'Alcohol Marrow Suppression, Megaloblastic Macrocytosis, Zieve Syndrome & Spur Cell Anemia',
    nameEs: 'Supresión Medular por Alcohol, Macrocitosis Megaloblástica, Síndrome de Zieve y Anemia de Células Espiculadas',
    pathophysiologyEn: 'Ethanol and acetaldehyde exert direct reversible cytotoxicity on bone marrow hematopoiesis—producing characteristic cytoplasmic vacuolization of erythroid and myeloid pronormoblasts, ring sideroblasts (via pyridoxal phosphate/ALAS2 inhibition), and impaired megakaryocyte thrombopoiesis. Concurrently, severe dietary folate and cobalamin (B12) deficiency impairs thymidylate synthase DNA synthesis (producing MCV > 100 fL oval macrocytes and hypersegmented neutrophils >= 5–6 lobes). In advanced alcoholic liver disease, abnormal cholesterol-to-phospholipid loading of RBC membranes produces rigid thorny acanthocytes ("spur cells") that undergo splenic destruction.',
    pathophysiologyEs: 'El etanol y el acetaldehído ejercen toxicidad directa sobre la médula ósea (vacuolización de pronormoblastos, sideroblastos en anillo y trombocitopenia). El déficit concomitante de folato y vitamina B12 altera la síntesis de ADN (macrocitosis con VCM > 100 fL y neutrófilos hipersegmentados >= 5–6 lóbulos). En la hepatopatía avanzada, el exceso de colesterol libre en la membrana eritrocitaria forma acantocitos rígidos ("spur cells" o células espiculadas) destruidos en el bazo.',
    clinicalPresentationEn: 'ZIEVE SYNDROME TRIAD vs. SPUR CELL ANEMIA: Zieve Syndrome presents in heavy alcohol use with the classic triad of 1) Coombs-negative Hemolytic Anemia, 2) Cholestatic Jaundice, and 3) Transient Hyperlipidemia/Hypertriglyceridemia, often accompanied by right upper quadrant pain and fever (frequently misdiagnosed as acute cholecystitis, leading to unnecessary cholecystectomy; resolves within weeks of alcohol cessation). In contrast, Spur Cell Hemolytic Anemia in decompensated cirrhosis (marked acanthocytes on smear, INR elevation, severe jaundice) carries a poor prognosis and is definitively cured only by liver transplantation. CARDINAL FOLATE-B12 NEUROSURVIVAL RULE: Never administer Folic Acid alone for macrocytic anemia without concurrently giving Vitamin B12 (Cyanocobalamin 1,000 mcg IM/PO) and Thiamine! Folate monotherapy corrects the megaloblastic blood count while masking and accelerating irreversible Vitamin B12 Subacute Combined Degeneration (SCD) of the spinal cord!',
    clinicalPresentationEs: 'TRÍADA DEL SÍNDROME DE ZIEVE vs. ANEMIA DE CÉLULAS ESPICULADAS: El Síndrome de Zieve cursa con la tríada de 1) Anemia hemolítica Coombs negativa, 2) Ictericia colestásica y 3) Hiperlipidemia transitoria con dolor en hipocondrio derecho (suele confundirse con colecistitis aguda; remite al suspender el alcohol). En cambio, la Anemia de Células Espiculadas (acantocitos masivos en cirrosis descompensada) indica mal pronóstico y requiere evaluación para trasplante hepático. REGLA CARDINAL FOLATO-B12: ¡Nunca administrar Ácido Fólico solo en una anemia macrocítica sin administrar simultáneamente Vitamina B12 (Cianocobalamina 1.000 mcg) y Tiamina! El folato solo corrige la anemia pero enmascara y precipita la Degeneración Combinada Subaguda medular irreversible por déficit de B12.',
  }),

  cirrhosisRebalancedHemostasis: Object.freeze({
    id: 'cirrhosis_rebalanced_hemostasis',
    nameEn: 'Cirrhosis Coagulopathy ("Rebalanced Hemostasis"), Thrombocytopenia & The Prophylactic FFP Fallacy',
    nameEs: 'Coagulopatía de la Cirrosis ("Hemostasia Reequilibrada"), Trombocitopenia y la Falacia del PFC Profiláctico',
    pathophysiologyEn: 'In alcohol- or HCV-related cirrhosis, decreased hepatic synthesis of procoagulant factors (II, V, VII, IX, X, XI) prolongs the PT/INR. However, hepatic synthesis of endogenous anticoagulants (Protein C, Protein S, Antithrombin) is equally reduced, while endothelial-derived Factor VIII and von Willebrand Factor (vWF) are markedly elevated and ADAMTS13 is reduced. As a result, thrombin generation in cirrhotic patients remains normal or even hypercoagulable ("rebalanced hemostasis"), meaning the standard INR only measures liver synthetic function and DOES NOT predict procedural or spontaneous bleeding risk.',
    pathophysiologyEs: 'En la cirrosis por alcohol o VHC, la menor síntesis hepática de factores procoagulantes (II, V, VII, IX, X, XI) prolonga el TP/INR. Sin embargo, también disminuyen los anticoagulantes naturales (Proteína C, Proteína S, Antitrombina) mientras aumentan el Factor VIII y el Factor von Willebrand (FvW) endoteliales. Esto crea una "hemostasia reequilibrada" donde la generación de trombina está conservada; por tanto, el INR refleja la función sintética hepática pero NO predice el riesgo de sangrado.',
    clinicalPresentationEn: 'AASLD / AGA CARDINAL DIRECTIVE — DO NOT TRANSFUSE PROPHYLACTIC FFP FOR ELEVATED INR: Administering Fresh Frozen Plasma (FFP) to "correct" an elevated INR prior to paracentesis, thoracentesis, central venous cannulation, or endoscopic variceal band ligation is CONTRAINDICATED! FFP fails to normalize the INR in > 85% of cirrhotic patients while delivering a massive colloid volume load (15–20 mL/kg) that directly elevates portal venous pressure, precipitates catastrophic variceal hemorrhage, and causes TRALI or TACO. EVIDENCE-BASED BLEEDING & PROCEDURAL PROTOCOL: 1) Check Serum Fibrinogen and Viscoelastic Testing (TEG / ROTEM); if active bleeding occurs or a high-risk procedure is planned with Fibrinogen < 100–120 mg/dL, transfuse low-volume Cryoprecipitate (not FFP). 2) Low-risk procedures (diagnostic/therapeutic paracentesis) are safe even at INR > 2.5 and platelets >= 20,000/mcL. 3) For elective high-risk procedures with severe thrombocytopenia (platelets < 50,000/mcL), consider oral TPO-receptor agonists (Avatrombopag or Lusutrombopag for 5–8 days pre-procedure) or targeted platelet transfusion.',
    clinicalPresentationEs: 'DIRECTIVA CARDINAL AASLD / AGA — PROHIBIDO TRANSFUNDIR PFC PROFILÁCTICO POR INR ELEVADO: ¡Administrar Plasma Fresco Congelado (PFC) para "corregir" un INR elevado antes de una paracentesis, toracocentesis, vía central o ligadura de várices está CONTRAINDICADO! El PFC no normaliza el INR y aporta una sobrecarga masiva de volumen que eleva directamente la presión portal, desencadena hemorragia variceal mortal y provoca edema pulmonar (TACO/TRALI). PROTOCOLO BASADO EN EVIDENCIA: 1) Medir Fibrinógeno sérico y tromboelastografía (TEG/ROTEM); si hay sangrado activo o Fibrinógeno < 100–120 mg/dL, transfundir Crioprecipitado de bajo volumen (no PFC). 2) La paracentesis es segura incluso con INR > 2,5 y plaquetas >= 20.000/mcL. 3) En procedimientos electivos de alto riesgo con plaquetas < 50.000/mcL, valorar agonistas del receptor de TPO (Avatrombopag o Lusutrombopag).',
  }),
});

// ============================================================================
// HARM REDUCTION DIRECTIVES & FIELD HEMATOLOGIC SAFETY RULES
// ============================================================================

export const HEMATOLOGY_HARM_REDUCTION_RULES = Object.freeze([
  {
    ruleNum: 1,
    titleEn: 'Never Administer Methylene Blue if G6PD Deficiency is Known or Suspected',
    titleEs: 'Nunca Administrar Azul de Metileno si se Conoce o Sospecha Déficit de G6PD',
    detailEn: 'In nitrite ("Poppers") or phenazopyridine methemoglobinemia, Methylene Blue requires NADPH from the G6PD enzyme to work. In G6PD deficiency, Methylene Blue fails to lower methemoglobin and triggers catastrophic, potentially fatal intravascular hemolysis. Use High-Dose IV Ascorbic Acid (Vitamin C) or exchange transfusion instead.',
    detailEs: 'En la metahemoglobinemia por nitritos ("Poppers") o fenazopiridina, el Azul de Metileno requiere NADPH de la enzima G6PD. En pacientes con déficit de G6PD, el Azul de Metileno fracasa y provoca una hemólisis intravascular masiva y mortal. Use Ácido Ascórbico IV en altas dosis (Vitamina C) o exanguinotransfusión.',
  },
  {
    ruleNum: 2,
    titleEn: 'Synthetic Cannabinoid ("K2/Spice") Bleeding: Months of High-Dose Oral Vitamin K1 Required',
    titleEs: 'Sangrado por Cannabinoides Sintéticos ("K2/Spice"): Meses de Vitamina K1 Oral en Altas Dosis',
    detailEn: 'Brodifacoum ("superwarfarin") rat poison sprayed on synthetic cannabinoids stays in the liver for 20 to 60+ days. Acute bleeding requires 4-Factor PCC + IV Vitamin K1, but single doses wear off in 24 hours. Patients must take 50–100 mg/day of oral Vitamin K1 (Phytonadione) for months to prevent fatal rebound hemorrhage.',
    detailEs: 'El brodifacoum ("superwarfarina") presente en cannabinoides sintéticos permanece en el hígado de 20 a más de 60 días. Tras revertir el sangrado agudo con 4F-PCC + Vitamina K1 IV, el paciente necesita 50–100 mg/día de Vitamina K1 oral (Fitomenadiona) durante meses para evitar una hemorragia mortal de rebote.',
  },
  {
    ruleNum: 3,
    titleEn: 'Cirrhosis Procedure Rule: Skip Prophylactic FFP for Elevated INR — Check Fibrinogen Instead',
    titleEs: 'Regla en Cirrosis: Evitar el Plasma Fresco Congelado (PFC) Profiláctico por INR Elevado',
    detailEn: 'In cirrhosis, an elevated INR reflects liver synthetic function, not bleeding risk ("rebalanced hemostasis"). Transfusing FFP before paracentesis or line placement does not fix the INR and dangerously increases portal pressure, risking variceal rupture. Check Fibrinogen and use low-volume Cryoprecipitate if < 100–120 mg/dL.',
    detailEs: 'En la cirrosis, el INR elevado no predice el sangrado ("hemostasia reequilibrada"). Transfundir PFC antes de una paracentesis sobrecarga el volumen, eleva la presión portal y puede romper várices esofágicas. Mida el Fibrinógeno y use Crioprecipitado si es < 100–120 mg/dL.',
  },
  {
    ruleNum: 4,
    titleEn: 'Cocaine + Earlobe Purpura or Sore Throat/Fever = Urgent CBC for Levamisole Agranulocytosis',
    titleEs: 'Cocaína + Púrpura en Orejas o Fiebre/Odinofagia = Hemograma Urgente por Agranulocitosis',
    detailEn: 'Levamisole in the cocaine supply destroys white blood cells (ANC < 500/mcL) and causes purple/black net-like rashes on the earlobes and cheeks. Any fever, chills, or severe sore throat after cocaine use requires an immediate emergency CBC with manual differential and empiric IV antibiotics within 60 minutes.',
    detailEs: 'El levamisol en la cocaína destruye los glóbulos blancos (RAN < 500/mcL) y causa manchas violáceas/negras en las orejas y mejillas. Cualquier fiebre o dolor de garganta intenso tras usar cocaína exige un hemograma urgente con fórmula manual y antibióticos IV en menos de 60 minutos.',
  },
  {
    ruleNum: 5,
    titleEn: 'Macrocytic Anemia Rule: Never Give Folic Acid Without Concurrent Vitamin B12 & Thiamine',
    titleEs: 'Regla en Anemia Macrocítica: Nunca Dar Ácido Fólico Sin Vitamina B12 y Tiamina',
    detailEn: 'Giving folic acid alone to a patient with macrocytic anemia (high MCV) can normalize the blood count while masking and accelerating permanent Vitamin B12 spinal cord nerve damage (Subacute Combined Degeneration). Always administer Vitamin B12 (Cyanocobalamin), Folic Acid, and Thiamine together.',
    detailEs: 'Administrar ácido fólico solo en una anemia macrocítica corrige el hemograma pero enmascara y acelera el daño medular irreversible por falta de Vitamina B12 (Degeneración Combinada Subaguda). Administre siempre Vitamina B12, Ácido Fólico y Tiamina conjuntamente.',
  },
  {
    ruleNum: 6,
    titleEn: 'Avoid Injecting Polymer-Matrix Pills (TMA Risk) & Avoid Prophylactic Platelets in TTP/TMA',
    titleEs: 'Evitar Inyectar Comprimidos Poliméricos (Riesgo de MAT) y Evitar Plaquetas en PTT/MAT',
    detailEn: 'Injecting crushed extended-release polymer tablets or quinine-cut heroin shreds red blood cells (schistocytes), consumes platelets, and causes kidney failure (TMA/TTP-HUS). In suspected TTP/TMA, draw ADAMTS13 before plasma exchange and avoid prophylactic platelet transfusions unless life-threatening bleeding occurs.',
    detailEs: 'Inyectar comprimidos con polímeros (PEO) o heroína con quinina fragmenta los glóbulos rojos (esquistocitos), agota las plaquetas y daña el riñón (MAT/PTT). Extraiga ADAMTS13 antes de la plasmaféresis y evite transfundir plaquetas de forma profiláctica salvo hemorragia vital.',
  },
]);

// ============================================================================
// IN-RAM EPHEMERAL STATE MANAGEMENT (ZERO STORAGE INVARIANT)
// ============================================================================

const DEFAULT_HEMATOLOGY_STATE = Object.freeze({
  activeTab: 'syndromes', // 'syndromes' | 'evaluator' | 'rules' | 'sbar'
  // Clinical Risk Evaluator Flags
  syntheticCannabinoidBleeding: false,
  chocolateCyanosisSaturationGap: false,
  knownOrSuspectedG6pdDeficiency: false,
  cocaineEarlobePurpuraOrFever: false,
  ivTabletPetechiaeDarkUrineTma: false,
  alcoholJaundiceHemolysisZieve: false,
  cirrhosisElevatedInrProcedure: false,
  macrocyticAnemiaNeuropathyB12: false,
  sbarCopied: false,
});

let hematologyRamState = { ...DEFAULT_HEMATOLOGY_STATE };
const stateListeners = new Set();

export function getHematologyState() {
  return { ...hematologyRamState };
}

export function setHematologyState(patch) {
  hematologyRamState = { ...hematologyRamState, ...patch };
  stateListeners.forEach((fn) => fn(getHematologyState()));
  return getHematologyState();
}

export function resetHematologyState() {
  hematologyRamState = { ...DEFAULT_HEMATOLOGY_STATE };
  stateListeners.forEach((fn) => fn(getHematologyState()));
  return getHematologyState();
}

export function subscribeHematologyState(fn) {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

// ============================================================================
// CLINICAL DECISION SUPPORT: HEMATOLOGY & COAGULOPATHY EVALUATOR
// ============================================================================

export function evaluateHematologyRisk(state = hematologyRamState) {
  const flags = [];
  let urgency = 'precautionary'; // 'emergency_911' | 'urgent_eval' | 'specialty_consult' | 'precautionary'

  const escalate = (level) => {
    const order = ['precautionary', 'specialty_consult', 'urgent_eval', 'emergency_911'];
    if (order.indexOf(level) > order.indexOf(urgency)) {
      urgency = level;
    }
  };

  // 1. Brodifacoum ("Superwarfarin") Synthetic Cannabinoid Coagulopathy (Emergency 911)
  if (state.syntheticCannabinoidBleeding) {
    escalate('emergency_911');
    flags.push({
      id: 'brodifacoum_superwarfarin_emergency',
      severity: 'critical',
      titleEn: 'Suspected Brodifacoum ("Superwarfarin") Coagulopathy from Adulterated Synthetic Cannabinoids',
      titleEs: 'Sospecha de Coagulopatía por Brodifacoum ("Superwarfarina") en Cannabinoides Sintéticos',
      descEn: 'CRITICAL HEMORRHAGIC EMERGENCY: Spontaneous hematuria, epistaxis, or bleeding after smoking K2/Spice suggests long-acting anticoagulant rodenticide (brodifacoum) poisoning (INR often > 10). Administer 4-Factor PCC (Kcentra 25–50 units/kg IV) + Vitamin K1 (Phytonadione) 10 mg slow IV immediately. Because brodifacoum has a 20–60+ day half-life, transition to massive oral Vitamin K1 (50–100 mg/day PO in divided doses) for 3–6+ months to prevent fatal rebound hemorrhage.',
      descEs: 'EMERGENCIA HEMORRÁGICA CRÍTICA: El sangrado espontáneo tras fumar K2/Spice sugiere intoxicación por brodifacoum (INR > 10). Administrar 4F-PCC (Kcentra 25–50 U/kg IV) + Vitamina K1 (Fitomenadiona) 10 mg IV lenta de inmediato. Por su vida media de 20–60+ días, mantener Vitamina K1 oral en dosis masivas (50–100 mg/día VO) durante 3–6+ meses.',
    });
  }

  // 2. Oxidant Methemoglobinemia & Heinz Body Hemolysis + G6PD Contraindication (Emergency 911)
  if (state.chocolateCyanosisSaturationGap) {
    escalate('emergency_911');
    if (state.knownOrSuspectedG6pdDeficiency) {
      flags.push({
        id: 'methemoglobinemia_g6pd_contraindication',
        severity: 'critical',
        titleEn: 'Methemoglobinemia + G6PD Deficiency: METHYLENE BLUE IS ABSOLUTELY CONTRAINDICATED!',
        titleEs: 'Metahemoglobinemia + Déficit de G6PD: ¡EL AZUL DE METILENO ESTÁ ABSOLUTAMENTE CONTRAINDICADO!',
        descEn: 'LETHAL ANTIDOTE TRAP: Slate-gray cyanosis, chocolate-brown blood, and SpO2 clamped near 85% indicate oxidant methemoglobinemia (nitrite "Poppers", phenazopyridine, dapsone). Because this patient has known or suspected G6PD deficiency, DO NOT ADMINISTER METHYLENE BLUE—it lacks NADPH to function and will trigger catastrophic, fatal intravascular hemolysis! Treat with High-Dose IV Ascorbic Acid (Vitamin C 1.5–2 g IV q6h), 100% O2, and emergent RBC exchange transfusion.',
        descEs: 'TRAMPA MORTAL DE ANTÍDOTO: Cianosis grisácea, sangre color chocolate y SpO2 fija en ~85 % indican metahemoglobinemia oxidativa. ¡Como existe déficit de G6PD conocido o sospechado, NO ADMINISTRE AZUL DE METILENO porque desencadenará una hemólisis intravascular masiva y letal! Tratar con Ácido Ascórbico IV en altas dosis (Vitamina C 1,5–2 g IV cada 6 h), O2 al 100 % y exanguinotransfusión urgente.',
      });
    } else {
      flags.push({
        id: 'methemoglobinemia_oxidant_hemolysis',
        severity: 'critical',
        titleEn: 'Oxidant Methemoglobinemia & Heinz-Body Hemolysis ("Saturation Gap")',
        titleEs: 'Metahemoglobinemia Oxidativa y Hemólisis por Cuerpos de Heinz ("Brecha de Saturación")',
        descEn: 'CRITICAL HYPOXIC EMERGENCY: Confirm MetHb level via arterial/venous CO-oximetry and screen peripheral smear for Heinz bodies and "bite cells". Screen for G6PD deficiency history first! If no G6PD deficiency is present and MetHb >= 20–30% (or symptomatic), administer Methylene Blue 1–2 mg/kg IV over 5 minutes. If G6PD status is deficient or hemolytic crisis ensues, use High-Dose IV Ascorbic Acid or exchange transfusion.',
        descEs: 'EMERGENCIA HIPÓXICA CRÍTICA: Confirmar nivel de MetaHb por CO-oximetría y buscar cuerpos de Heinz y "bite cells" en frotis. Descartar antecedente de déficit de G6PD primero; si no hay déficit de G6PD y MetaHb >= 20–30 %, administrar Azul de Metileno 1–2 mg/kg IV en 5 min. Si hay sospecha de déficit de G6PD, usar Ácido Ascórbico IV.',
      });
    }
  } else if (state.knownOrSuspectedG6pdDeficiency) {
    escalate('specialty_consult');
    flags.push({
      id: 'g6pd_oxidant_avoidance_directive',
      severity: 'moderate',
      titleEn: 'G6PD Deficiency Oxidant Drug & Methylene Blue Avoidance Alert',
      titleEs: 'Alerta de Déficit de G6PD: Evitar Oxidantes y Azul de Metileno',
      descEn: 'Patients with G6PD deficiency must strictly avoid volatile alkyl nitrites ("Poppers"), phenazopyridine (Azo), dapsone, rasburicase, primaquine, and Methylene Blue, all of which precipitate severe Heinz-body intravascular hemolytic anemia.',
      descEs: 'Los pacientes con déficit de G6PD deben evitar estrictamente nitritos inhalados ("Poppers"), fenazopiridina, dapsona, rasburicasa, primaquina y Azul de Metileno por riesgo de crisis hemolítica intravascular grave.',
    });
  }

  // 3. Levamisole-Adulterated Cocaine Vasculitis & Agranulocytosis (Emergency 911)
  if (state.cocaineEarlobePurpuraOrFever) {
    escalate('emergency_911');
    flags.push({
      id: 'levamisole_agranulocytosis_vasculitis',
      severity: 'critical',
      titleEn: 'Suspected Levamisole-Adulterated Cocaine ANCA Vasculitis & Neutropenic Sepsis / Agranulocytosis',
      titleEs: 'Sospecha de Vasculitis ANCA por Cocaína con Levamisol y Sepsis Neutropénica / Agranulocitosis',
      descEn: 'CRITICAL NEUTROPENIC EMERGENCY: Retiform purpura on the earlobes/cheeks or high fever/severe pharyngitis after cocaine use signals levamisole-induced agranulocytosis (ANC < 500/mcL) and dual MPO/PR3 ANCA vasculopathy. Obtain stat CBC with manual differential and blood cultures. If febrile and neutropenic, administer empiric IV Cefepime (2 g q8h) or Piperacillin-Tazobactam (4.5 g q6h) within 60 minutes plus Filgrastim (G-CSF 5 mcg/kg/day), and cease all cocaine exposure.',
      descEs: 'EMERGENCIA NEUTROPÉNICA CRÍTICA: La púrpura retiforme en orejas/mejillas o fiebre/faringitis tras usar cocaína indica agranulocitosis por levamisol (RAN < 500/mcL) y vasculopatía ANCA. Solicitar hemograma urgente con fórmula manual y hemocultivos. Si hay fiebre neutropénica, iniciar Cefepima o Piperacilina-Tazobactam IV en < 60 minutos más Filgrastim (G-CSF) y suspender la cocaína.',
    });
  }

  // 4. IV Polymer-Tablet (PEO) or Quinine Thrombotic Microangiopathy (TMA / TTP-HUS) (Emergency 911)
  if (state.ivTabletPetechiaeDarkUrineTma) {
    escalate('emergency_911');
    flags.push({
      id: 'drug_induced_tma_ttp_hus',
      severity: 'critical',
      titleEn: 'Suspected Drug-Induced Thrombotic Microangiopathy (TMA / TTP-HUS) from IV Tablets or Quinine',
      titleEs: 'Sospecha de Microangiopatía Trombótica (MAT / PTT-SHU) por Comprimidos IV o Quinina',
      descEn: 'CRITICAL MICROVASCULAR EMERGENCY: Petechiae, dark urine, oliguria, or neurologic changes after injecting crushed ER opioid tablets (PEO polymer) or quinine-adulterated heroin indicate Microangiopathic Hemolytic Anemia (schistocytes + severe thrombocytopenia + AKI). Draw ADAMTS13 activity BEFORE plasma infusion, calculate PLASMIC score, initiate emergent Therapeutic Plasma Exchange (PLEX) if TTP cannot be excluded, and AVOID prophylactic platelet transfusions!',
      descEs: 'EMERGENCIA MICROVASCULAR CRÍTICA: Petequias, orina oscura, oliguria o confusión tras inyectar comprimidos poliméricos (PEO) o heroína con quinina indican Anemia Hemolítica Microangiopática (esquistocitos + trombocitopenia grave + lesión renal). Extraer ADAMTS13 ANTES de infundir plasma, iniciar plasmaféresis (PLEX) urgente si no se descarta PTT y ¡EVITAR transfusiones profilácticas de plaquetas!',
    });
  }

  // 5. Alcohol Jaundice + Coombs-Negative Hemolysis: Zieve Syndrome vs. Spur Cell Anemia (Urgent Eval)
  if (state.alcoholJaundiceHemolysisZieve) {
    escalate('urgent_eval');
    flags.push({
      id: 'zieve_syndrome_spur_cell_eval',
      severity: 'high',
      titleEn: 'Alcohol-Associated Hemolytic Anemia: Zieve Syndrome vs. Cirrhotic Spur Cell Anemia',
      titleEs: 'Anemia Hemolítica Asociada al Alcohol: Síndrome de Zieve vs. Anemia de Células Espiculadas',
      descEn: 'URGENT HEMATOLOGIC & HEPATIC EVALUATION: Evaluate peripheral blood smear, Coombs test, reticulocyte count, LDH, haptoglobin, and fasting lipid panel. The triad of cholestatic jaundice, transient hyperlipidemia, and Coombs-negative hemolysis in alcohol use defines Zieve Syndrome (resolves with abstinence; avoid unnecessary cholecystectomy). If abundant thorny acanthocytes ("spur cells") are present in decompensated cirrhosis, refer urgently for liver transplant evaluation.',
      descEs: 'EVALUACIÓN HEMATOLÓGICA Y HEPÁTICA URGENTE: Revisar frotis periférico, test de Coombs, reticulocitos, LDH, haptoglobina y perfil lipídico. La tríada de ictericia, hiperlipidemia y hemólisis Coombs negativa define el Síndrome de Zieve (remite con abstinencia; evitar colecistectomía innecesaria). Si predominan acantocitos ("spur cells") en cirrosis avanzada, derivar a evaluación de trasplante hepático.',
    });
  }

  // 6. Cirrhosis Elevated INR / Thrombocytopenia Before Procedure (Urgent Eval)
  if (state.cirrhosisElevatedInrProcedure) {
    escalate('urgent_eval');
    flags.push({
      id: 'cirrhosis_rebalanced_hemostasis_ffp_ban',
      severity: 'high',
      titleEn: 'Cirrhosis Procedural Hemostasis: DO NOT Transfuse Prophylactic FFP for Elevated INR',
      titleEs: 'Hemostasia en Cirrosis: NO Transfundir PFC Profiláctico por INR Elevado',
      descEn: 'AASLD / AGA DIRECTIVE: Cirrhosis creates "rebalanced hemostasis" where INR does not predict bleeding. Prophylactic Fresh Frozen Plasma (FFP) transfusion before paracentesis, thoracentesis, or line placement is CONTRAINDICATED because volume overload elevates portal venous pressure and precipitates variceal bleeding and TACO/TRALI. Instead, check serum Fibrinogen (transfuse low-volume Cryoprecipitate if < 100–120 mg/dL) and use TEG/ROTEM or TPO agonists (Avatrombopag/Lusutrombopag) for severe thrombocytopenia (< 50,000/mcL) before high-risk procedures.',
      descEs: 'DIRECTIVA AASLD / AGA: En la cirrosis existe "hemostasia reequilibrada" y el INR no predice el sangrado. El Plasma Fresco Congelado (PFC) profiláctico antes de paracentesis o vías centrales está CONTRAINDICADO porque sobrecarga el volumen, eleva la presión portal y provoca sangrado variceal. Mida el Fibrinógeno (use Crioprecipitado si < 100–120 mg/dL) y valore TEG/ROTEM o agonistas de TPO si plaquetas < 50.000/mcL.',
    });
  }

  // 7. Macrocytic Anemia (High MCV) + Neuropathy: Folate-B12 Co-Administration Rule (Specialty Consult)
  if (state.macrocyticAnemiaNeuropathyB12) {
    escalate('specialty_consult');
    flags.push({
      id: 'megaloblastic_macrocytosis_b12_folate_rule',
      severity: 'moderate',
      titleEn: 'Megaloblastic Macrocytosis (MCV > 100 fL): Mandatory Vitamin B12 + Folate + Thiamine Co-Administration',
      titleEs: 'Macrocitosis Megaloblástica (VCM > 100 fL): Coadministración Obligatoria de Vitamina B12 + Folato + Tiamina',
      descEn: 'NEURO-HEMATOLOGIC SAFETY RULE: Check serum Vitamin B12, methylmalonic acid (MMA), homocysteine, and RBC folate. NEVER administer Folic Acid alone—folate monotherapy corrects megaloblastic anemia while precipitating irreversible Vitamin B12 Subacute Combined Degeneration (dorsal column paresthesias, ataxia, spastic paraparesis). Administer Cyanocobalamin (1,000 mcg IM/PO), Folic Acid (1 mg PO daily), and Thiamine concurrently.',
      descEs: 'REGLA DE SEGURIDAD NEURO-HEMATOLÓGICA: Medir Vitamina B12, ácido metilmalónico (AMM) y folato. ¡NUNCA administrar Ácido Fólico solo! El folato en monoterapia corrige la anemia pero acelera la Degeneración Combinada Subaguda medular irreversible por déficit de B12. Administrar Cianocobalamina (1.000 mcg), Ácido Fólico (1 mg) y Tiamina simultáneamente.',
    });
  }

  // Default Precautionary Guidance
  if (flags.length === 0) {
    flags.push({
      id: 'standard_hematology_precautions',
      severity: 'low',
      titleEn: 'Standard Hematologic & Coagulopathy Harm Reduction Directives',
      titleEs: 'Directivas Estándar de Reducción de Daños Hematológicos y de Coagulación',
      descEn: 'No acute hemorrhagic, hemolytic, or agranulocytic red flags selected. Remind patients to report unexplained bruising, red/dark urine, earlobe rashes, or fevers immediately; avoid synthetic cannabinoids ("K2/Spice") and nitrite inhalants ("Poppers"); and ensure B12 + folate supplementation in alcohol recovery.',
      descEs: 'Sin signos de alarma hemorrágicos, hemolíticos o agranulocíticos seleccionados. Recomendar consultar ante hematomas inexplicables, orina roja/oscura, lesiones en orejas o fiebre; evitar cannabinoides sintéticos ("K2/Spice") y nitritos ("Poppers"); y suplementar B12 + folato en recuperación de alcohol.',
    });
  }

  return { urgency, flags };
}

// ============================================================================
// ZERO-PII SBAR CLINICAL HANDOFF GENERATOR
// ============================================================================

export function formatHematologySbarText(state = hematologyRamState, lang = 'en') {
  const isEs = lang === 'es';
  const evalResult = evaluateHematologyRisk(state);

  const urgencyLabel = {
    emergency_911: isEs ? 'EMERGENCIA HEMATOLÓGICA / TOXICOLÓGICA CRÍTICA (UCI / URGENCIAS INMEDIATA)' : 'CRITICAL HEMATOLOGIC / TOXICOLOGIC EMERGENCY (STAT ED / ICU)',
    urgent_eval: isEs ? 'EVALUACIÓN HOSPITALARIA URGENTE' : 'URGENT HOSPITAL EVALUATION',
    specialty_consult: isEs ? 'INTERCONSULTA HEMATOLÓGICA & AJUSTE TERAPÉUTICO' : 'SPECIALTY HEMATOLOGY CONSULTATION & REGIMEN ADJUSTMENT',
    precautionary: isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD HEMATOLÓGICA' : 'PRECAUTIONARY HEMATOLOGIC DIRECTIVES',
  }[evalResult.urgency];

  const lines = [];
  lines.push('====================================================================');
  lines.push(isEs
    ? 'RESUMEN CLÍNICO SBAR HARBORPATH — HEMATOLOGÍA, COAGULOPATÍA Y HEMÓLISIS (ZERO-PII)'
    : 'HARBORPATH CLINICAL SBAR SUMMARY — HEMATOLOGY, COAGULOPATHY & HEMOLYSIS (ZERO-PII)');
  lines.push('====================================================================');
  lines.push(`${isEs ? 'Nivel de Agudeza' : 'Acuity Level'}: ${urgencyLabel}`);
  lines.push(`${isEs ? 'Aviso de Privacidad' : 'Privacy Notice'}: ${isEs ? '100% En Memoria RAM Efímera (Sin PII)' : '100% Ephemeral In-RAM (Zero PII)'}`);
  lines.push('');

  // SITUATION
  lines.push(isEs ? '[S] SITUACIÓN (SITUATION):' : '[S] SITUATION:');
  if (state.syntheticCannabinoidBleeding) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Sangrado espontáneo tras cannabinoides sintéticos (K2/Spice) — Sospecha de coagulopatía por Brodifacoum ("Superwarfarina").'
      : '  - CRITICAL ALERT: Spontaneous bleeding post-synthetic cannabinoids (K2/Spice) — Suspected Brodifacoum ("Superwarfarin") coagulopathy.');
  }
  if (state.chocolateCyanosisSaturationGap) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Cianosis central, sangre color chocolate y brecha de saturación (SpO2 ~85%) — Metahemoglobinemia y hemólisis por cuerpos de Heinz.'
      : '  - CRITICAL ALERT: Central cyanosis, chocolate-brown blood, and saturation gap (SpO2 ~85%) — Methemoglobinemia & Heinz-body hemolysis.');
  }
  if (state.knownOrSuspectedG6pdDeficiency) {
    lines.push(isEs
      ? '  - CONTRAINDICACIÓN ESTRICTA: Déficit de G6PD conocido o sospechado — ¡PROHIBIDO ADMINISTRAR AZUL DE METILENO!'
      : '  - STRICT CONTRAINDICATION: Known or suspected G6PD deficiency — DO NOT ADMINISTER METHYLENE BLUE!');
  }
  if (state.cocaineEarlobePurpuraOrFever) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Púrpura retiforme en orejas/mejillas o fiebre tras cocaína — Vasculitis ANCA y Agranulocitosis por Levamisol.'
      : '  - CRITICAL ALERT: Earlobe/cheek retiform purpura or fever post-cocaine — Levamisole ANCA vasculitis & Agranulocytosis.');
  }
  if (state.ivTabletPetechiaeDarkUrineTma) {
    lines.push(isEs
      ? '  - ALERTA CRÍTICA: Petequias, orina oscura y lesión renal tras inyectar comprimidos/heroína — Microangiopatía Trombótica (MAT / PTT-SHU).'
      : '  - CRITICAL ALERT: Petechiae, dark urine, and AKI post-IV tablets/heroin — Thrombotic Microangiopathy (TMA / TTP-HUS).');
  }
  if (!state.syntheticCannabinoidBleeding && !state.chocolateCyanosisSaturationGap && !state.cocaineEarlobePurpuraOrFever && !state.ivTabletPetechiaeDarkUrineTma) {
    lines.push(isEs
      ? '  - Evaluación de citopenias, coagulopatía hepática o hemólisis inducida por sustancias sin choque hemorrágico inmediato.'
      : '  - Evaluation for substance-induced cytopenias, hepatic coagulopathy, or hemolysis without immediate hemorrhagic shock.');
  }
  lines.push('');

  // BACKGROUND
  lines.push(isEs ? '[B] ANTECEDENTES Y FACTORES HEMATOLÓGICOS (BACKGROUND):' : '[B] BACKGROUND & HEMATOLOGIC FACTORS:');
  lines.push(`  - ${isEs ? 'Ictericia + Hemólisis Coombs Negativa (Síndrome de Zieve / Spur Cells)' : 'Jaundice + Coombs-Negative Hemolysis (Zieve Syndrome / Spur Cells)'}: ${state.alcoholJaundiceHemolysisZieve ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Cirrosis con INR Elevado Antes de Procedimiento (Hemostasia Reequilibrada)' : 'Cirrhosis with Elevated INR Pre-Procedure (Rebalanced Hemostasis)'}: ${state.cirrhosisElevatedInrProcedure ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push(`  - ${isEs ? 'Anemia Macrocítica (VCM > 100 fL) + Neuropatía (Regla B12 + Folato)' : 'Macrocytic Anemia (MCV > 100 fL) + Neuropathy (B12 + Folate Rule)'}: ${state.macrocyticAnemiaNeuropathyB12 ? (isEs ? 'SÍ' : 'YES') : 'NO'}`);
  lines.push('');

  // ASSESSMENT & RECOMMENDATIONS
  lines.push(isEs ? '[A/R] EVALUACIÓN Y DIRECTIVAS TERAPÉUTICAS (ASSESSMENT & RECOMMENDATIONS):' : '[A/R] ASSESSMENT & THERAPEUTIC DIRECTIVES:');
  evalResult.flags.forEach((f, idx) => {
    lines.push(`  ${idx + 1}. ${isEs ? f.titleEs : f.titleEn}`);
    lines.push(`     -> ${isEs ? f.descEs : f.descEn}`);
  });

  lines.push('====================================================================');
  return lines.join('\n');
}

// ============================================================================
// DOM VIEW RENDERER (WCAG 2.2 AA, ZERO INNERHTML, ZERO INLINE STYLE)
// ============================================================================

export function hematologyCareView() {
  const container = h('div', { class: 'hematology-care-view view-container' });

  function render() {
    clear(container);
    const state = getHematologyState();
    const isEs = getLang() === 'es';

    // Header Banner
    const header = h('header', { class: 'hematology-header' }, [
      h('div', { class: 'hematology-badge-row' }, [
        h('span', { class: 'hematology-clinical-badge' }, isEs ? 'Hematología, Coagulopatía y Toxicología Sanguínea' : 'Hematology, Coagulopathy & Blood Toxicology'),
        h('span', { class: 'hematology-privacy-pill' }, isEs ? '100% En Memoria RAM · Sin PII' : '100% Ephemeral RAM · Zero PII'),
      ]),
      h('h1', { class: 'hematology-title' }, isEs
        ? 'Navegador de Hematología, Coagulopatías, Vasculitis por Levamisol y Hemólisis Tóxica'
        : 'Hematology, Coagulopathy, Levamisole Vasculitis & Toxic Hemolysis Navigator'),
      h('p', { class: 'hematology-subtitle' }, isEs
        ? 'Soporte de decisiones clínicas (ASH, ACMT, AASLD y AGA) para agranulocitosis por levamisol, coagulopatía por brodifacoum (K2/Spice), metahemoglobinemia en déficit de G6PD, microangiopatía trombótica (MAT/PTT) y hemostasia en cirrosis.'
        : 'Evidence-based clinical decision support (ASH, ACMT, AASLD & AGA) for levamisole agranulocytosis, brodifacoum (K2/Spice) coagulopathy, G6PD methemoglobinemia, thrombotic microangiopathy (TMA/TTP), and cirrhosis hemostasis.'),
    ]);
    container.appendChild(header);

    // Primary Tab Navigation
    const tabs = [
      { id: 'syndromes', labelEn: 'Hematologic & Coagulation Syndromes', labelEs: 'Síndromes Hematológicos y Coagulación', iconName: 'activity' },
      { id: 'evaluator', labelEn: 'Clinical Triage & Risk Evaluator', labelEs: 'Triaje Clínico & Evaluador', iconName: 'clipboard' },
      { id: 'rules', labelEn: 'Field Hematology Safety Rules', labelEs: 'Reglas Hematológicas de Campo', iconName: 'shield' },
      { id: 'sbar', labelEn: 'Clinical SBAR Note', labelEs: 'Nota Clínica SBAR', iconName: 'file-text' },
    ];

    const tabNav = h('nav', { class: 'hematology-tab-nav', role: 'tablist', 'aria-label': 'Hematology Care Sections' },
      tabs.map((tab) => {
        const isActive = state.activeTab === tab.id;
        const btn = h('button', {
          type: 'button',
          role: 'tab',
          class: `hematology-tab-btn ${isActive ? 'active' : ''}`,
          'aria-selected': isActive ? 'true' : 'false',
          'aria-controls': 'hematology-tab-panel',
          id: `tab-btn-${tab.id}`,
          tabindex: isActive ? '0' : '-1',
        }, [
          icon(tab.iconName, { class: 'hematology-tab-icon' }),
          h('span', {}, isEs ? tab.labelEs : tab.labelEn),
        ]);
        btn.addEventListener('click', () => setHematologyState({ activeTab: tab.id }));
        return btn;
      })
    );
    container.appendChild(tabNav);
    syncTablists(container);

    // Tab Panel Container
    const panel = h('section', {
      class: 'hematology-tab-panel',
      role: 'tabpanel',
      id: 'hematology-tab-panel',
      'aria-labelledby': `tab-btn-${state.activeTab}`,
    });
    container.appendChild(panel);

    // Render Content Based on Active Tab
    if (state.activeTab === 'syndromes') {
      renderSyndromesPanel(panel, isEs);
    } else if (state.activeTab === 'evaluator') {
      renderEvaluatorPanel(panel, state, isEs);
    } else if (state.activeTab === 'rules') {
      renderRulesPanel(panel, isEs);
    } else if (state.activeTab === 'sbar') {
      renderSbarPanel(panel, state, isEs);
    }

    // Educational Disclaimer Footer
    const footer = h('footer', { class: 'hematology-footer-notice' }, [
      icon('info', { class: 'hematology-footer-icon' }),
      h('p', {}, isEs
        ? 'Aviso Clínico: HarborPath proporciona pautas basadas en consensos de ASH, ACMT, AASLD y AGA. No sustituye el frotis de sangre periférica, CO-oximetría, determinación de ADAMTS13 o valoración hematológica de urgencia.'
        : 'Clinical Notice: HarborPath provides evidence-based guidelines from ASH, ACMT, AASLD, and AGA. It does not replace peripheral blood smear review, CO-oximetry, ADAMTS13 testing, or emergent hematology evaluation.'),
    ]);
    container.appendChild(footer);
  }

  // Panel 1: Syndromes
  function renderSyndromesPanel(panel, isEs) {
    const intro = h('div', { class: 'hematology-panel-intro' }, [
      h('h2', {}, isEs ? 'Taxonomía de Emergencias Hematológicas, Coagulopatías y Hemólisis Inducidas por Sustancias' : 'Substance-Induced Hematologic, Coagulopathic & Hemolytic Syndromes Taxonomy'),
      h('p', {}, isEs
        ? 'Fisiopatología y directivas terapéuticas para vasculitis/agranulocitosis por levamisol, coagulopatía por brodifacoum, metahemoglobinemia oxidativa en déficit de G6PD, MAT/PTT, síndrome de Zieve y hemostasia en cirrosis.'
        : 'Pathophysiology and therapeutic directives for levamisole vasculitis/agranulocytosis, brodifacoum coagulopathy, oxidant methemoglobinemia in G6PD deficiency, TMA/TTP, Zieve syndrome, and cirrhosis hemostasis.'),
    ]);
    panel.appendChild(intro);

    const list = h('div', { class: 'hematology-syndromes-list' },
      Object.values(HEMATOLOGY_SYNDROME_PROFILES).map((syndrome) => {
        return h('article', { class: 'hematology-syndrome-card' }, [
          h('h3', { class: 'hematology-syndrome-title' }, isEs ? syndrome.nameEs : syndrome.nameEn),
          h('div', { class: 'hematology-section' }, [
            h('strong', {}, isEs ? 'Mecanismo Fisiopatológico:' : 'Pathophysiologic Mechanism:'),
            h('p', {}, isEs ? syndrome.pathophysiologyEs : syndrome.pathophysiologyEn),
          ]),
          h('div', { class: 'hematology-section' }, [
            h('strong', {}, isEs ? 'Presentación Clínica y Manejo Crítico:' : 'Clinical Presentation & Critical Management:'),
            h('p', {}, isEs ? syndrome.clinicalPresentationEs : syndrome.clinicalPresentationEn),
          ]),
        ]);
      })
    );
    panel.appendChild(list);
  }

  // Panel 2: Evaluator
  function renderEvaluatorPanel(panel, state, isEs) {
    const intro = h('div', { class: 'hematology-panel-intro' }, [
      h('h2', {}, isEs ? 'Evaluador de Riesgo Hematológico y Triaje de Coagulopatía/Hemólisis' : 'Hematology Risk Evaluator & Coagulopathy/Hemolysis Triage'),
      h('p', {}, isEs
        ? 'Marque los hallazgos clínicos y antecedentes para obtener la estratificación de agudeza y las contraindicaciones críticas de antídotos y transfusiones.'
        : 'Select observed clinical signs and history factors to receive real-time acuity stratification and critical antidote/transfusion contraindications.'),
    ]);
    panel.appendChild(intro);

    const checklistItems = [
      { key: 'syntheticCannabinoidBleeding', labelEn: 'Spontaneous hematuria, epistaxis, or severe bleeding after smoking K2/Spice synthetic cannabinoids (Brodifacoum)', labelEs: 'Hematuria espontánea, epistaxis o sangrado grave tras fumar cannabinoides sintéticos K2/Spice (Brodifacoum)' },
      { key: 'chocolateCyanosisSaturationGap', labelEn: 'Slate-gray cyanosis, chocolate-brown blood, or SpO2 stuck near 85% despite O2 after Poppers/phenazopyridine (MetHb)', labelEs: 'Cianosis grisácea, sangre color chocolate o SpO2 fija en ~85 % pese a O2 tras Poppers/fenazopiridina (MetaHb)' },
      { key: 'knownOrSuspectedG6pdDeficiency', labelEn: 'Known or suspected G6PD deficiency (Strict Contraindication to Methylene Blue — use IV Ascorbic Acid)', labelEs: 'Déficit de G6PD conocido o sospechado (Contraindicación Estricta al Azul de Metileno — usar Ácido Ascórbico IV)' },
      { key: 'cocaineEarlobePurpuraOrFever', labelEn: 'Purple/black retiform purpura on earlobes/cheeks or high fever/sore throat after cocaine use (Levamisole ANC < 500)', labelEs: 'Púrpura retiforme violácea/negra en orejas/mejillas o fiebre/odinofagia tras cocaína (Levamisol RAN < 500)' },
      { key: 'ivTabletPetechiaeDarkUrineTma', labelEn: 'Petechiae, dark urine, low platelets, and kidney injury after injecting crushed pills or heroin (TMA / TTP-HUS)', labelEs: 'Petequias, orina oscura, plaquetas bajas y fallo renal tras inyectar comprimidos o heroína (MAT / PTT-SHU)' },
      { key: 'alcoholJaundiceHemolysisZieve', labelEn: 'Jaundice, dark urine, hyperlipidemia, and Coombs-negative hemolysis in heavy alcohol use (Zieve / Spur Cell)', labelEs: 'Ictericia, orina oscura, hiperlipidemia y hemólisis Coombs negativa en consumo de alcohol (Zieve / Spur Cell)' },
      { key: 'cirrhosisElevatedInrProcedure', labelEn: 'Cirrhosis with elevated INR or low platelets needing paracentesis or procedure (Skip Prophylactic FFP)', labelEs: 'Cirrosis con INR elevado o plaquetas bajas que requiere paracentesis o procedimiento (Evitar PFC Profiláctico)' },
      { key: 'macrocyticAnemiaNeuropathyB12', labelEn: 'Macrocytic anemia (MCV > 100 fL) with numbness/tingling or ataxia (Mandatory B12 + Folate + Thiamine Rule)', labelEs: 'Anemia macrocítica (VCM > 100 fL) con parestesias o ataxia (Regla Obligatoria Vitamina B12 + Folato + Tiamina)' },
    ];

    const checklistForm = h('div', { class: 'hematology-evaluator-checklist' },
      checklistItems.map((item) => {
        const isChecked = !!state[item.key];
        const label = h('label', { class: `hematology-check-item ${isChecked ? 'selected' : ''}` }, [
          h('input', {
            type: 'checkbox',
            checked: isChecked,
            class: 'hematology-checkbox',
          }),
          h('span', { class: 'hematology-check-label' }, isEs ? item.labelEs : item.labelEn),
        ]);
        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
          setHematologyState({ [item.key]: e.target.checked });
        });
        return label;
      })
    );
    panel.appendChild(checklistForm);

    // Reset Button
    const resetBar = h('div', { class: 'hematology-evaluator-actions' }, [
      h('button', {
        type: 'button',
        class: 'hematology-reset-btn',
      }, [
        icon('rotate-ccw', { class: 'hematology-btn-icon' }),
        h('span', {}, isEs ? 'Restablecer Evaluación' : 'Reset Assessment'),
      ]),
    ]);
    resetBar.querySelector('button').addEventListener('click', () => resetHematologyState());
    panel.appendChild(resetBar);

    // Results Box
    const evalResult = evaluateHematologyRisk(state);
    const resultsContainer = h('div', { class: `hematology-eval-results acuity-${evalResult.urgency}` }, [
      h('div', { class: 'hematology-eval-urgency-badge' }, [
        icon(evalResult.urgency === 'emergency_911' ? 'alert-octagon' : evalResult.urgency === 'urgent_eval' ? 'alert-triangle' : 'info', { class: 'hematology-urgency-icon' }),
        h('span', { class: 'hematology-urgency-text' },
          evalResult.urgency === 'emergency_911'
            ? (isEs ? 'EMERGENCIA HEMATOLÓGICA / TOXICOLÓGICA CRÍTICA (LLAMAR AL 911 / UCI)' : 'CRITICAL HEMATOLOGIC / TOXICOLOGIC EMERGENCY (CALL 911 / STAT ICU)')
            : evalResult.urgency === 'urgent_eval'
            ? (isEs ? 'EVALUACIÓN HOSPITALARIA URGENTE & PROTOCOLO INDICADO' : 'URGENT HOSPITAL EVALUATION & PROTOCOL REQUIRED')
            : evalResult.urgency === 'specialty_consult'
            ? (isEs ? 'INTERCONSULTA HEMATOLÓGICA & AJUSTE TERAPÉUTICO' : 'SPECIALTY HEMATOLOGY CONSULTATION & REGIMEN ADJUSTMENT')
            : (isEs ? 'DIRECTIVAS PREVENTIVAS DE SALUD HEMATOLÓGICA' : 'PRECAUTIONARY HEMATOLOGIC DIRECTIVES')
        ),
      ]),
      h('div', { class: 'hematology-eval-flags-list' },
        evalResult.flags.map((flag) => {
          return h('div', { class: 'hematology-flag-item' }, [
            h('h4', { class: 'hematology-flag-title' }, isEs ? flag.titleEs : flag.titleEn),
            h('p', { class: 'hematology-flag-desc' }, isEs ? flag.descEs : flag.descEn),
          ]);
        })
      ),
    ]);
    panel.appendChild(resultsContainer);
  }

  // Panel 3: Rules
  function renderRulesPanel(panel, isEs) {
    const intro = h('div', { class: 'hematology-panel-intro' }, [
      h('h2', {}, isEs ? 'Directivas de Seguridad Hematológica y Reducción de Daños de Campo' : 'Field Hematologic Safety & Harm Reduction Directives'),
      h('p', {}, isEs
        ? 'Seis reglas clínicas fundamentales para prevenir hemólisis letal por azul de metileno en déficit de G6PD, sangrado de rebote por brodifacoum, sepsis por levamisol y sobrecarga por PFC en cirrosis.'
        : 'Six essential clinical directives to prevent lethal methylene blue hemolysis in G6PD deficiency, brodifacoum rebound bleeding, levamisole neutropenic sepsis, and FFP overload in cirrhosis.'),
    ]);
    panel.appendChild(intro);

    const rulesList = h('div', { class: 'hematology-directives-grid' },
      HEMATOLOGY_HARM_REDUCTION_RULES.map((rule) => {
        return h('article', { class: 'hematology-directive-card' }, [
          h('div', { class: 'hematology-directive-num' }, `0${rule.ruleNum}`),
          h('h3', { class: 'hematology-directive-title' }, isEs ? rule.titleEs : rule.titleEn),
          h('p', { class: 'hematology-directive-text' }, isEs ? rule.detailEs : rule.detailEn),
        ]);
      })
    );
    panel.appendChild(rulesList);
  }

  // Panel 4: SBAR Note
  function renderSbarPanel(panel, state, isEs) {
    const intro = h('div', { class: 'hematology-panel-intro' }, [
      h('h2', {}, isEs ? 'Generador de Traspaso Clínico SBAR (Zero-PII)' : 'Zero-PII SBAR Clinical Handoff Note Generator'),
      h('p', {}, isEs
        ? 'Genere una nota clínica estructurada en formato SBAR (Situación, Antecedentes, Evaluación, Recomendación) para Hematología, Banco de Sangre, Toxicología, Urgencias y UCI. 100% en memoria RAM.'
        : 'Generate a structured SBAR clinical handoff note (Situation, Background, Assessment, Recommendation) for Hematology, Blood Bank, Toxicology, Emergency Medicine, and ICU. Stored 100% in ephemeral RAM.'),
    ]);
    panel.appendChild(intro);

    const sbarText = formatHematologySbarText(state, isEs ? 'es' : 'en');

    const copyBtn = h('button', {
      type: 'button',
      class: 'hematology-copy-btn',
    }, [
      icon('copy', { class: 'hematology-btn-icon' }),
      h('span', {}, isEs ? 'Copiar Informe SBAR' : 'Copy SBAR Note'),
    ]);

    copyBtn.addEventListener('click', async () => {
      await copyText(sbarText, {
        trigger: copyBtn,
        copiedLabel: isEs ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!',
        announceSuccess: isEs ? 'Informe SBAR copiado al portapapeles.' : 'SBAR note copied to clipboard.',
      });
    });

    const actionContainer = h('div', { class: 'hematology-sbar-actions' }, [copyBtn]);
    panel.appendChild(actionContainer);

    const sbarBox = h('pre', { class: 'hematology-sbar-output', 'aria-label': 'SBAR Clinical Output' }, sbarText);
    panel.appendChild(sbarBox);
  }

  render();
  wireTablistKeyboard(container);
  const unsubscribe = subscribeHematologyState(render);

  return container;
}
