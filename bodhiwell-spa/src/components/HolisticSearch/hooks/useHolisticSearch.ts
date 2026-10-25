import { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { normalize, tokenize, normalizeTight } from '../utils/searchUtils';
import { useSearchFiltersContext } from '../../../context/SearchFiltersContext';
import {
    INTENT_MAP,
    INTENT_TO_DIM,
    DIM_KEYWORDS,
    BODHI_INTENTS,
    BODY_PART_TOKENS,
    BODHI_DATA
} from '../constant/HolisticSearch.constant';
import { BodhiIntent, ScoredSpec } from '../types/HolisticSearch.types';

export const useHolisticSearch = () => {
    const { t, i18n } = useTranslation();
    const { filters, setFilter, applyFilters, specialtiesList } = useSearchFiltersContext();

    const [selectedDim, setSelectedDim] = useState<string | null>(null);
    const [hoveredDimName, setHoveredDimName] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [isVideoEnded, setIsVideoEnded] = useState(false);

    const [suggestedTop, setSuggestedTop] = useState<string[]>([]);
    const [autoMatchedSpecs, setAutoMatchedSpecs] = useState<string[]>([]);
    const [isNoMatch, setIsNoMatch] = useState(false);
    const [stageSubText, setStageSubText] = useState<string>("");

    const dimLabels: Record<string, string> = useMemo(() => ({
        cuerpo: t('HolisticSearch.dimensions.cuerpo.label', 'Cuerpo'),
        mente: t('HolisticSearch.dimensions.mente.label', 'Mente'),
        energia: t('HolisticSearch.dimensions.energia.label', 'Energía'),
        conciencia: t('HolisticSearch.dimensions.conciencia.label', 'Conciencia')
    }), [t]);

    const searchPlaceholder = useMemo(() => {
        if (!selectedDim) return t('HolisticSearch.inputPlaceholder', '¿Qué sentís que necesitás hoy?');
        const label = dimLabels[selectedDim] || selectedDim;
        return t('HolisticSearch.inputPlaceholderDim', { label, defaultValue: `Escribí dentro de ${label}…` });
    }, [selectedDim, dimLabels, t]);

    const dynamicData = useMemo(() => {
        const base = JSON.parse(JSON.stringify(BODHI_DATA));
        if (!specialtiesList) return base;

        Object.keys(base).forEach(k => base[k].especialidades = []);

        specialtiesList.forEach((spec: any) => {
            const dimSlug = spec.dimension?.slug?.toLowerCase();
            let targetKey = Object.keys(base).find(k => k === dimSlug);

            if (targetKey && base[targetKey]) {
                base[targetKey].especialidades.push({
                    uid: spec.uid,
                    name: spec.name,
                    description: spec.description || '',
                    alias: spec.alias || [],
                    aborda: spec.cover_wards || [],
                });
                if (!base[targetKey].uid) base[targetKey].uid = spec.dimension.uid;
            }
        });
        return base;
    }, [specialtiesList]);

    const tokensForSemantic = (query: string) => {
        const tokens = tokenize(query);
        return tokens.filter(t => !BODY_PART_TOKENS.has(t));
    };

    const detectIntent = (query: string): BodhiIntent | null => {
        const q = normalize(query);
        let best: BodhiIntent | null = null;
        let bestScore = 0;
        const intents = BODHI_INTENTS as BodhiIntent[];

        for (const intent of intents) {
            let score = 0;
            for (const p of intent.patterns) {
                const pn = normalize(p);
                if (q.includes(pn)) score += pn.includes(" ") ? 6 : 3;
            }
            if (score > bestScore) {
                bestScore = score;
                best = intent;
            }
        }
        return (best && bestScore >= 6) ? best : null;
    };

    const detectPreferredDim = (query: string) => {
        const tokens = tokenize(query);
        if (!tokens.length) return null;
        const tokenSet = new Set(tokens);
        for (const [intentKey, words] of Object.entries(INTENT_MAP)) {
            if (words.map(normalize).some((w) => tokenSet.has(w))) {
                return INTENT_TO_DIM[intentKey] || null;
            }
        }
        return null;
    };

    const computeSmartMatches = useCallback((q: string) => {
        const query = normalize(q);
        const queryTight = normalizeTight(q);
        const tokens = tokenize(q);
        const semTokens = tokensForSemantic(q);

        if (!tokens.length) return null;

        const intent = detectIntent(q);
        const preferredDim = intent?.dim || detectPreferredDim(q);

        let scoredSpecs: ScoredSpec[] = [];

        Object.entries(dynamicData).forEach(([dimKey, dimData]: [string, any]) => {
            dimData.especialidades.forEach((esp: any) => {
                let score = 0;
                const nameT = normalizeTight(esp.name);
                if (queryTight.includes(nameT) || nameT.includes(queryTight)) score += 120;
                esp.alias?.forEach((a: string) => {
                    const at = normalizeTight(a);
                    if (queryTight.includes(at) || at.includes(queryTight)) score += 70;
                });
                esp.aborda?.forEach((item: string) => {
                    const it = normalize(item);
                    if (query.includes(it)) score += 30;
                    semTokens.forEach(t => { if (t.length >= 4 && it.includes(t)) score += 10; });
                });
                const desc = normalize(esp.description);
                semTokens.forEach(t => { if (t.length >= 4 && desc.includes(t)) score += 6; });

                if (score > 0) {
                    scoredSpecs.push({ uid: esp.uid, dim: dimKey, score, name: esp.name });
                }
            });
        });

        let finalDim: string | null = null;
        let topUids: string[] = [];
        let othersUids: string[] = [];

        if (intent) {
            finalDim = intent.dim;
            const boostList = intent.boost || [];

            const boostedUids = scoredSpecs
                .filter(s => s.dim === finalDim && boostList.some(bn => normalize(bn) === normalize(s.name)))
                .map(s => s.uid);

            const semanticMatches = scoredSpecs
                .filter(s => s.dim === finalDim)
                .sort((a, b) => b.score - a.score)
                .map(s => s.uid);

            const merged = Array.from(new Set([...boostedUids, ...semanticMatches]));
            topUids = merged.slice(0, 2);
            othersUids = merged.slice(2);
        } else if (scoredSpecs.length > 0) {
            const bestScoreResult = [...scoredSpecs].sort((a, b) => b.score - a.score)[0];
            finalDim = preferredDim || bestScoreResult.dim;
            const dimMatches = scoredSpecs.filter(s => s.dim === finalDim).sort((a, b) => b.score - a.score);

            topUids = dimMatches.slice(0, 2).map(m => m.uid);
            othersUids = dimMatches.slice(2).map(m => m.uid);
        } else if (preferredDim) {
            finalDim = preferredDim;
        } else {
            let bestDimKey = null;
            let bestDimScore = 0;
            for (const [dk, kws] of Object.entries(DIM_KEYWORDS)) {
                let s = 0;
                tokens.forEach(t => { if (kws.some(k => normalize(k).includes(t))) s += 10; });
                if (s > bestDimScore) { bestDimScore = s; bestDimKey = dk; }
            }
            finalDim = bestDimKey;
        }

        if (!finalDim) return null;

        if (topUids.length < 2 && dynamicData[finalDim]) {
            const allInDim = dynamicData[finalDim].especialidades;
            for (const spec of allInDim) {
                if (!topUids.includes(spec.uid)) {
                    topUids.push(spec.uid);
                }
                if (topUids.length === 2) break;
            }
        }

        return {
            dim: finalDim,
            top: topUids,
            others: othersUids,
            topNames: topUids.map(uid => {
                const s = scoredSpecs.find(x => x.uid === uid);
                return s ? s.name : (specialtiesList as any[]).find((x: any) => x.uid === uid)?.name;
            }).filter(Boolean) as string[]
        };
    }, [dynamicData, specialtiesList]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFilter('q', val);

        if (val.trim().length === 0) {
            if (window.location.pathname.includes('/professionals') && suggestedTop.length > 0) {
                setIsNoMatch(false);
                setAutoMatchedSpecs([]);
                return;
            }
            resetSearch();
            return;
        }

        const res = computeSmartMatches(val);

        if (res) {
            setSelectedDim(res.dim);
            setIsNoMatch(false);
            setSuggestedTop(res.top);
            setAutoMatchedSpecs([...res.top, ...res.others]);
            setStageSubText(t(`HolisticSearch.dimensions.${res.dim}.phrase`, { defaultValue: dynamicData[res.dim].frase }));
        } else {
            setSelectedDim('cuerpo');
            const defaultSpecs = dynamicData['cuerpo']?.especialidades
                .filter((e: any) => {
                    const n = normalize(e.name);
                    return n.includes("medicina general") || n.includes("medicina familiar");
                })
                .map((e: any) => e.uid) || [];

            setSuggestedTop(defaultSpecs.slice(0, 2));
            setAutoMatchedSpecs(defaultSpecs);
        }
    };

    const handlePetalClick = (dim: string) => {
        setFilter('q', '');
        setSelectedDim(dim);
        setStageSubText(t(`HolisticSearch.dimensions.${dim}.phrase`, { defaultValue: dynamicData[dim].frase }));
        setIsNoMatch(false);
        setSuggestedTop([]);
        setAutoMatchedSpecs([]);
    };

    const handleTagClick = (espUid: string) => {
        setSuggestedTop(prev =>
            prev.includes(espUid)
                ? prev.filter(u => u !== espUid)
                : [...prev, espUid]
        );
    };

    const handleMouseMove = (e: React.MouseEvent, dim: string) => {
        setHoveredDimName(dimLabels[dim]);
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    const currentDimData = useMemo(() => selectedDim ? dynamicData[selectedDim] : null, [selectedDim, dynamicData]);

    const sortedEspecialidades = useMemo(() => {
        if (!currentDimData) return [];
        return [...currentDimData.especialidades].sort((a, b) => {
            const aM = autoMatchedSpecs.includes(a.uid) ? 1 : 0;
            const bM = autoMatchedSpecs.includes(b.uid) ? 1 : 0;
            return bM - aM;
        });
    }, [currentDimData, autoMatchedSpecs]);

    const location = useLocation();
    const navigate = useNavigate();

    const applyFiltersSearch = useCallback(() => {
        const params = new URLSearchParams();
        if (currentDimData?.uid) params.append('dimension', currentDimData.uid);
        suggestedTop.forEach(uid => params.append('specialties', uid));
        if (filters.q.trim()) params.append('q', filters.q.trim());
        
        const targetUrl = `/professionals?${params.toString()}`;

        if (location.pathname === '/professionals') {
            navigate(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    }, [suggestedTop, filters.q, currentDimData, location.pathname, navigate]);

    const resetSearch = useCallback(() => {
        setFilter('q', '');
        setSelectedDim(null);
        setIsNoMatch(false);
        setSuggestedTop([]);
        setAutoMatchedSpecs([]);
        setStageSubText("");
    }, [setFilter]);

    useEffect(() => {
        if (filters.dimension?.uid) {
            const dimEntry = Object.entries(dynamicData).find(([_, data]: [string, any]) => data.uid === filters.dimension?.uid);
            if (dimEntry) {
                setSelectedDim(dimEntry[0]);
                setStageSubText(t(`HolisticSearch.dimensions.${dimEntry[0]}.phrase`, { defaultValue: (dimEntry[1] as any).frase }));
            }
        }
        if (filters.specialties && filters.specialties.length > 0) {
            setSuggestedTop(filters.specialties.map(s => s.uid));
        }
    }, [filters.dimension, filters.specialties, dynamicData, t]);


    const stageSubtitle = useMemo(() => {
        if (!suggestedTop?.length) {
            return isNoMatch
                ? t('HolisticSearch.noMatch', 'Probá con otra palabra (síntoma, emoción, zona del cuerpo o lo que querés lograr).')
                : (selectedDim ? stageSubText : t('HolisticSearch.defaultStageSub', 'Elegí una dimensión, buscá un profesional o escribí lo que necesitás para encontrar un acompañamiento afín a tu momento'));
        }

        const names = suggestedTop
            .map(uid => currentDimData?.especialidades.find((e: any) => e.uid === uid)?.name)
            .filter(Boolean).slice(0, 2);

        const prefix = names.length === 1 ? `${t('HolisticSearch.suggestion', 'Sugerencia')}: ` : `${t('HolisticSearch.suggestions', 'Sugerencias')}: `;
        const connector = ` ${t('HolisticSearch.and', 'y')} `;
        return `${prefix}${names.join(connector)}.`;
    }, [suggestedTop, isNoMatch, selectedDim, stageSubText, currentDimData, t, i18n.language]);

    return {
        t, selectedDim, hoveredDimName, tooltipPos, isVideoEnded,
        currentDimData, sortedEspecialidades, autoMatchedSpecs, isNoMatch, stageSubText,
        setIsVideoEnded, handleInputChange, handlePetalClick, handleTagClick,
        handleMouseMove, handleMouseLeave: () => setHoveredDimName(null),
        suggestedTop, filters, applyFiltersSearch, applyFilters, resetSearch,
        searchPlaceholder, stageSubtitle
    };
};