---
title: "Where a New Concept Must Enter: Entry Point Gates Cross-Task Usability in Unified Multimodal Models"
collection: publications
category: manuscripts
permalink: /publication/2026-08-18-entry-point-umm
excerpt: 'We isolate generation-to-understanding and understanding-to-generation transfer in unified multimodal models by binding a novel visual concept through exactly one task direction, finding that cross-task usability is governed by where the binding enters the shared computation.'
date: 2026-08-18
venue: 'arXiv preprint'
header:
  teaser: entry_point_umm_teaser.png
authors: 'Zongyang Qiu, Yihan Wu, Kaixuan Fan, Bo Li, Hui Xiong'
arxiv: 'https://arxiv.org/abs/2608.17564'
code: 'https://github.com/Zane-ZYQiu/entry-point-umm'
bibtex: |
  @misc{qiu2026entrypoint,
    title={Where a New Concept Must Enter: Entry Point Gates Cross-Task Usability in Unified Multimodal Models},
    author={Qiu, Zongyang and Wu, Yihan and Fan, Kaixuan and Li, Bo and Xiong, Hui},
    year={2026},
    eprint={2608.17564},
    archivePrefix={arXiv},
    primaryClass={cs.CV},
    url={https://arxiv.org/abs/2608.17564}
  }
---

**Abstract:** Unified multimodal models (UMMs) are motivated by the hope that understanding and generation reinforce each other but controlled ablations repeatedly find that adding a generation objective leaves understanding flat. Joint-training studies cannot settle the disagreement: with overlapping supervision, a gain cannot be attributed to the architecture rather than the data. To further investigate the relationship between the two directions in UMMs, we separate them by construction. A novel visual entity, a rendered 3D asset paired with a pseudo-word screened for absence from the frozen model's behavior, is bound through exactly one task direction, and the untrained direction is then measured. We find that the channel is real in both directions, but the directions differ in kind: generation training installs a name the model can only match among candidates; understanding training installs one it can also produce. What governs cross-task usability is *where* the binding enters the shared computation. An alignment probe predicts export across 36 configurations (Spearman ρ = +0.68). That objective's alignment term, maximized in closed form over activations with every weight frozen, makes a concept drawable when injected at layer 7 of 28 and is indistinguishable from the base model from layer 14 on, while the weight-based version of the same edit peaks at layers 10-14. In an observational series of four models, this window appears only where the understanding pathway is a semantic vision encoder, suggesting that unified weights are not enough: the two directions must share a semantic format at the entry point. Exploiting the rule, a mid-stack alignment objective acquires the concept for a 0.1% relative loss of the model's general text-to-image ability, against 41% for the standard generative route.
