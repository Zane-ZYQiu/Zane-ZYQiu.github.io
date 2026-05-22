---
permalink: /
title: "Zongyang (Zane) Qiu 「邱宗扬」"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

I'm Zongyang Qiu, a final-year Computer Science undergraduate at [Fudan University,](https://www.fudan.edu.cn/en) and an incoming Mphil student at [HKUST(GZ)](https://www.hkust-gz.edu.cn), advised by [Prof. Hui Xiong.](https://hkustai.github.io/)

Currently, I am a resarch intern at [Alpha-MLLM Group,](https://github.com/Alpha-VLLM) Shanghai AI Lab, focusing on building the next-generation DLLM and Visual Agents. Prior to that, I worked with [Dr. Zeyu Wang](https://cislab.hkust-gz.edu.cn/members/zeyu-wang) at CIS Lab, HKUST(GZ), and with [Prof. Wenhan Luo](https://whluo.github.io) at C4 Group, HKUST.

I am deeply passionate about extensive topics about Computer Vision and Computer Graphics, I aim to explore the construction of biological-like visual intelligence, which should be capable of autonomous understanding, decision-making, and generation within both physical and digital worlds. My current research focuses on multimodal learning of VLMs and reasoning ability in visual genetative models.

## News

<div class="news-box" markdown="1">

- **April 2026**: Honored to be named a Shanghai Outstanding Graduate (Top 5%).
- **Jan 2026**: Joined Shanghai AI Laboratory as a Research Intern.
- **Jan 2026**: Delighted to attend AAAI 2026 in Singapore and give an oral presentation.

</div>

<style>
/* --- Section headings (## News / Publications / Service) --- */
#main .page__content h2 {
  position: relative;
  padding: 0.15em 0 0.15em 0.7em;
  margin-top: 1.6em;
  margin-bottom: 0.7em;
  font-weight: 600;
  letter-spacing: 0.01em;
  border-left: 4px solid var(--global-link-color);
  border-bottom: 1px solid rgba(128, 128, 128, 0.18);
}

/* --- News box --- */
.news-box {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px 18px 12px 22px;
  margin-bottom: 1.5em;
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-radius: 8px;
  background: linear-gradient(
    180deg,
    rgba(82, 173, 200, 0.06) 0%,
    rgba(128, 128, 128, 0.03) 100%
  );
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.news-box ul {
  margin: 0;
  padding-left: 1.2em;
  list-style: none;
}
.news-box li {
  position: relative;
  margin-bottom: 0.45em;
  padding-left: 0.2em;
  font-size: 0.95em;
  line-height: 1.55;
}
.news-box li::before {
  content: "";
  position: absolute;
  left: -0.9em;
  top: 0.65em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--global-link-color);
  opacity: 0.75;
}
.news-box li strong {
  color: var(--global-link-color);
  font-weight: 600;
}
.news-box::-webkit-scrollbar { width: 6px; }
.news-box::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.4);
  border-radius: 3px;
}

/* --- Publication cards --- */
.archive__item {
  padding: 10px;
  border-radius: 8px;
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    background-color 0.18s ease;
}
.archive__item:hover {
  transform: translateY(-2px);
  background-color: rgba(82, 173, 200, 0.05);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
.archive__item-title a:hover {
  color: var(--global-link-color) !important;
}
</style>

## Publications

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}

## Service

- Reviewer, AAAI 2026
- Reviewer, IEEE Transactions on Affective Computing
