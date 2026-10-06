"""English, Telugu and Hindi text for advice and alerts."""
LANGS = ("en", "te", "hi")

NAMES = {
    "en": {"temperature": "Temperature", "ph": "pH", "do": "Dissolved oxygen", "turbidity": "Turbidity", "ammonia": "Ammonia"},
    "te": {"temperature": "ఉష్ణోగ్రత", "ph": "pH", "do": "కరిగిన ఆక్సిజన్", "turbidity": "టర్బిడిటీ", "ammonia": "అమ్మోనియా"},
    "hi": {"temperature": "तापमान", "ph": "pH", "do": "घुली ऑक्सीजन", "turbidity": "गंदलापन", "ammonia": "अमोनिया"},
}

ADVICE = {
    "en": {
        ("do", "low"): "Switch on aerators now and hold feeding until oxygen is back above 5 mg/L.",
        ("temperature", "high"): "Add cool fresh water or shade, run aerators, and halve the feed.",
        ("temperature", "low"): "Reduce feeding and avoid handling fish; cold slows digestion.",
        ("ph", "low"): "Add agricultural lime in small doses and recheck in an hour.",
        ("ph", "high"): "Exchange 10-20% of the water and avoid heavy feeding in bright sun.",
        ("turbidity", "high"): "Cut feeding, check for algal bloom, and exchange some water.",
        ("ammonia", "high"): "Stop feeding, exchange 20-30% of the water, aerate, and look for dead fish or leftover feed.",
    },
    "te": {
        ("do", "low"): "వెంటనే ఏరేటర్లు ఆన్ చేయండి. ఆక్సిజన్ 5 mg/L పైకి వచ్చే వరకు మేత వేయకండి.",
        ("temperature", "high"): "చల్లని మంచినీరు కలపండి లేదా నీడ కల్పించండి, ఏరేటర్లు నడపండి, మేతను సగానికి తగ్గించండి.",
        ("temperature", "low"): "మేత తగ్గించండి, చేపలను ముట్టుకోకండి; చలికి జీర్ణక్రియ మందగిస్తుంది.",
        ("ph", "low"): "వ్యవసాయ సున్నం కొద్ది కొద్దిగా వేసి, ఒక గంట తర్వాత మళ్లీ పరీక్షించండి.",
        ("ph", "high"): "10-20% నీటిని మార్చండి, ఎండ ఎక్కువగా ఉన్నప్పుడు ఎక్కువ మేత వేయకండి.",
        ("turbidity", "high"): "మేత తగ్గించండి, ఆల్గే వ్యాప్తి ఉందేమో చూడండి, కొంత నీటిని మార్చండి.",
        ("ammonia", "high"): "మేత ఆపండి, 20-30% నీటిని మార్చండి, గాలి అందించండి, చనిపోయిన చేపలు లేదా మిగిలిన మేత ఉందేమో చూడండి.",
    },
    "hi": {
        ("do", "low"): "तुरंत एयरेटर चालू करें और ऑक्सीजन 5 mg/L से ऊपर आने तक चारा न दें।",
        ("temperature", "high"): "ठंडा ताज़ा पानी डालें या छाया करें, एयरेटर चलाएं और चारा आधा कर दें।",
        ("temperature", "low"): "चारा कम करें और मछलियों को न छुएं; ठंड में पाचन धीमा हो जाता है।",
        ("ph", "low"): "थोड़ा-थोड़ा कृषि चूना डालें और एक घंटे बाद फिर जांचें।",
        ("ph", "high"): "10-20% पानी बदलें और तेज़ धूप में ज़्यादा चारा न दें।",
        ("turbidity", "high"): "चारा कम करें, शैवाल (काई) की जांच करें और कुछ पानी बदलें।",
        ("ammonia", "high"): "चारा बंद करें, 20-30% पानी बदलें, हवा दें और मरी मछली या बचा हुआ चारा देखें।",
    },
}

TPL = {
    "en": {
        "heads": "Heads-up: {name} may cross {target} in about {eta} min. ",
        "unusual": "These readings look unusual as a group. Inspect the pond and check sensor calibration.",
        "crit": "{name} is critical ({v})",
        "out": "{name} is outside the safe range ({v})",
        "pred": "Predicted: {name} may cross {target} in about {eta} min",
        "allok": "All five readings are inside the safe range."
    },
    "te": {
        "heads": "హెచ్చరిక: {name} సుమారు {eta} నిమిషాల్లో {target} దాటవచ్చు. ",
        "unusual": "ఈ రీడింగ్‌లు కలిపి చూస్తే అసాధారణంగా ఉన్నాయి. చెరువును పరిశీలించి, సెన్సార్లను తనిఖీ చేయండి.",
        "crit": "{name} ప్రమాద స్థాయిలో ఉంది ({v})",
        "out": "{name} సురక్షిత పరిధి దాటింది ({v})",
        "pred": "అంచనా: {name} సుమారు {eta} నిమిషాల్లో {target} దాటవచ్చు",
        "allok": "ఐదు రీడింగ్‌లు సురక్షిత పరిధిలో ఉన్నాయి."
    },
    "hi": {
        "heads": "सावधान: {name} लगभग {eta} मिनट में {target} पार कर सकता है। ",
        "unusual": "ये रीडिंग मिलकर असामान्य लग रही हैं। तालाब देखें और सेंसर की जांच करें।",
        "crit": "{name} खतरे के स्तर पर है ({v})",
        "out": "{name} सुरक्षित सीमा से बाहर है ({v})",
        "pred": "अनुमान: {name} लगभग {eta} मिनट में {target} पार कर सकता है",
        "allok": "पांचों रीडिंग सुरक्षित सीमा में हैं।"
    },
}

def advice(p, side):
    return {l: ADVICE[l][(p, side)] for l in LANGS}

def say(key, p=None, **kw):
    return {l: TPL[l][key].format(name=NAMES[l][p] if p else "", **kw) for l in LANGS}
