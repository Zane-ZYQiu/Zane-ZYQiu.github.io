---
title: "RoboAware: Learning to Coordinate Embodied Skills from Counterfactual Outcomes"
collection: publications
category: manuscripts
permalink: /publication/2026-10-08-roboaware
excerpt: 'RoboAware learns a state-conditioned coordinator from counterfactual outcomes to decide when embodied coding agents should call modular robot skills or frozen end-to-end policies.'
date: 2026-10-08
venue: 'arXiv preprint'
header:
  teaser: roboaware_teaser.png
authors: 'Bohan Zhou*, Xingbei Chen*, Emily Huang, Weilin Ruan, Haojian Huang, Yehang Zhang, Zexi Li, Wenqian Li, Qize Yu, Zetian Song, Leyi Wu, Jinghao Li, Mingxuan Song, Xinrun Xu, Zongyang Qiu, Yangkai Wei, Tianyi Zhang, Kaiwen Zhou, Yinchuan Li, James Cheng'
arxiv: 'https://arxiv.org/abs/2610.11480'
bibtex: |
  @misc{zhou2026roboaware,
    title={RoboAware: Learning to Coordinate Embodied Skills from Counterfactual Outcomes},
    author={Zhou, Bohan and Chen, Xingbei and Huang, Emily and Ruan, Weilin and Huang, Haojian and Zhang, Yehang and Li, Zexi and Li, Wenqian and Yu, Qize and Song, Zetian and Wu, Leyi and Li, Jinghao and Song, Mingxuan and Xu, Xinrun and Qiu, Zongyang and Wei, Yangkai and Zhang, Tianyi and Zhou, Kaiwen and Li, Yinchuan and Cheng, James},
    year={2026},
    eprint={2610.11480},
    archivePrefix={arXiv},
    primaryClass={cs.RO},
    url={https://arxiv.org/abs/2610.11480}
  }
---

**Abstract:** Embodied coding agents can combine modular robot skills with frozen end-to-end policies, yet effective composition requires anticipating which policy family will succeed in the current physical state. We present RoboAware, which builds on coding agents' skill orchestration by learning only a state-conditioned responsibility coordinator from counterfactual outcomes. Inspired by the success of REPL, we propose the P<sup>5</sup> schema and formulate a hierarchical MDP based on it. P<sup>5</sup> organizes skills uniformly into five semantic stages, defining where responsibility can be compared. To address the lack of counterfactual branch outcomes in existing work, we introduce State-Locked Counterfactual Branching (SCB), which restores the same training state to generate and execute a code block from each admissible family, exposing outcomes that selected-branch experience leaves unobserved. Building on this, we propose Execution-Aware Learning (EAL), which combines Monte Carlo tree search with Q-learning to distill these outcomes into family-conditioned values. At deployment, the coordinator selects the policy family according to observable context, and the frozen coding agent generates the next local code block. Comprehensive single-episode evaluations on 100 tasks show that RoboAware reaches a 77.0% overall success rate, with SOTA averages of 90.0% on RoboSuite, 73.8% on diverse LIBERO-Pro task clusters, and 90.0% on challenging RoboTwin bimanual tasks, outperforming existing code-as-policy and VLA-harness baselines.
