---
title: "Intern Lumina U2: A Multi-Codebook Diffusion Large Language Model for Omni-Visual Understanding and Image Generation"
collection: publications
category: manuscripts
permalink: /publication/2026-09-12-internlumina-u2
excerpt: 'Intern Lumina U2 is a diffusion language model that represents multi-codebook visual tokens in a fully discrete space, supporting image, video, and 3D inputs within a single backbone for visual understanding, image generation, and image editing.'
date: 2026-10-14
venue: 'arXiv preprint'
header:
  teaser: interlumina_u2_teaser.png
authors: 'Qian Yu, Zongyang Qiu, Juncheng Yan, Hongliang Li, Qi Qin, et al.'
co_first: true
author_note: 'Co-first author'
arxiv: 'https://arxiv.org/abs/2610.20818'
project_page: 'https://internlm.github.io/InternLumina-U2/'
code: 'https://github.com/InternLM/InternLumina-U2'
bibtex: |
  @misc{yu2026internlumina,
    title={Intern Lumina U2: A Multi-Codebook Diffusion Large Language Model for Omni-Visual Understanding and Image Generation},
    author={Yu, Qian and Qiu, Zongyang and Yan, Juncheng and Li, Hongliang and Qin, Qi and Wang, Keqi and Luo, Siqi and Ju, Junkui and Mi, Yapeng and Lu, Tiantian and Liu, Tian and Xie, Pengyu and Ji, Chenhao and Zhang, Minghui and Zhao, Yiang and Yan, Siyu and Xu, Haiying and Wang, Yanbo and Shen, Jianghan and Pu, Yuandong and Lei, Jiayi and Zhang, Borui and Shi, Jinxin and Zhang, Bo and Zang, Yuhang and Ye, Shenglong and Gu, Lixin and Zhang, Hongjie and Liu, Linghan and Chen, Xinyuan and Cao, Yuewen and Zhang, Lihe and Liu, Xiaohong and He, Junjun and Liu, Qiangwei and Zhang, Qi and Cheng, Yu and Xue, Tianfan and Xiong, Hui and Xu, Chang and Qiao, Yu and Liu, Yihao and Fu, Bin},
    year={2026},
    eprint={2610.20818},
    archivePrefix={arXiv},
    primaryClass={cs.CV},
    url={https://arxiv.org/abs/2610.20818}
  }
---

**Abstract:** Unified multimodal generation covers discrete, continuous, and hybrid paradigms. Discrete approaches with single-codebook visual tokenizers align naturally with text modeling but have limited representational capacity. Continuous and hybrid approaches retain richer visual representations, but they model text and images in heterogeneous spaces with different training objectives, potentially introducing optimization conflicts between modalities with misaligned representation spaces. These choices expose a central question: how to efficiently model high-capacity visual representations alongside textual content in a shared optimization space within a single backbone. We present Intern Lumina U2, to our knowledge the first diffusion language model to represent multi-codebook visual tokens in a fully discrete space. Each visual position is represented by a group of codes from complementary codebooks, increasing its representational capacity while preserving compatibility with discrete text modeling. At the input, the embeddings are concatenated at each position; at the output, a lightweight multi-codebook autoregressive head predicts the codes within each position sequentially, while the diffusion backbone processes all positions in parallel. Built on the unified 4D representation of AToken, Intern Lumina U2 supports image, video, and 3D inputs within a single backbone and achieves leading performance among unified models in visual understanding, image generation, and image editing. We further build a full-stack training, inference, and evaluation system on both Ascend and NVIDIA platforms to verify the cross-platform effectiveness of our model. We also improve the inference efficiency through a stability-aware sampling strategy, which combines confidence-plateau-guided unmasking approach with drift-triggered cache refreshing mechanisms, accelerating image generation by 4.45×.
