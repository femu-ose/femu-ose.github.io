---
title: Cite FEMU
description: "Get the FEMU citation and learn which source revision, configuration, guest environment, and artifact details to report with research results."
---

# Cite FEMU

Cite the FEMU paper for any use of FEMU. If you use FDP, the CXL SSD or
computational storage, also cite the paper that part comes from. The entries
below are the ones the FEMU repository and the
[FEMU Manual](/manual) publish.

| Paper | Venue | Cite it when you use |
| --- | --- | --- |
| [The CASE of FEMU: Cheap, Accurate, Scalable and Extensible Flash Emulator](https://www.usenix.org/conference/fast18/presentation/li) | FAST '18 | FEMU, any mode |
| [Characterizing and Emulating FDP SSDs with WARP](https://www.usenix.org/conference/fast26/presentation/song) | FAST '26 | Flexible Data Placement |
| [Cylon: Fast and Accurate Full-System Emulation of CXL-SSDs](https://www.usenix.org/conference/fast26/presentation/yoon) | FAST '26 | The CXL SSD (`femu-cxl-ssd`) |
| [CEMU: Enabling Full-System Emulation of Computational Storage Beyond Hardware Limits](https://doi.org/10.1145/3779212.3790137) | ASPLOS '26 | Computational storage (CSD) |

## FEMU (FAST '18)

```bibtex
@inproceedings{Li+18-FEMU,
  author    = {Huaicheng Li and Mingzhe Hao and Michael Hao Tong and
               Swaminathan Sundararaman and Matias Bj{\o}rling and Haryadi S. Gunawi},
  title     = {{The CASE of FEMU: Cheap, Accurate, Scalable and Extensible Flash Emulator}},
  booktitle = {16th USENIX Conference on File and Storage Technologies (FAST 18)},
  pages     = {83--90},
  year      = {2018},
}
```

The repository's [CITATION.cff](https://github.com/MoatLab/FEMU/blob/master/CITATION.cff)
carries this entry, so GitHub's **Cite this repository** button and reference
managers that read CFF give you it directly.

## WARP (FAST '26), for FDP

```bibtex
@inproceedings{Song+26-WARP,
  author    = {Inho Song and Shoaib Asif Qazi and Javier Gonz{\'a}lez and
               Matias Bj{\o}rling and Sam H. Noh and Huaicheng Li},
  title     = {{Characterizing and Emulating FDP SSDs with WARP}},
  booktitle = {24th USENIX Conference on File and Storage Technologies (FAST 26)},
  pages     = {347--362},
  year      = {2026},
}
```

## Cylon (FAST '26), for the CXL SSD

```bibtex
@inproceedings{Yoon+26-Cylon,
  author    = {Dongha Yoon and Hansen Idden and Jinshu Liu and Berkay Inceisci and
               Sam H. Noh and Huaicheng Li},
  title     = {{Cylon: Fast and Accurate Full-System Emulation of CXL-SSDs}},
  booktitle = {24th USENIX Conference on File and Storage Technologies (FAST 26)},
  pages     = {313--327},
  year      = {2026},
}
```

## CEMU (ASPLOS '26), for computational storage

```bibtex
@inproceedings{Zhang+26-CEMU,
  author    = {Qiuyang Zhang and Jiapin Wang and You Zhou and Peng Xu and
               Kai Lu and Jiguang Wan and Fei Wu and Tao Lu},
  title     = {{CEMU: Enabling Full-System Emulation of Computational Storage
               Beyond Hardware Limits}},
  booktitle = {Proceedings of the 31st ACM International Conference on
               Architectural Support for Programming Languages and Operating
               Systems (ASPLOS '26), Volume 2},
  pages     = {323--341},
  year      = {2026},
  doi       = {10.1145/3779212.3790137},
}
```

The other modes come from the FEMU paper itself, so the FAST '18 entry is
enough for them.

## Who else cites FEMU

Google Scholar lists the
[papers that cite the FAST '18 paper](https://scholar.google.com/scholar?cites=16485597046278505365).
The [research page](/docs/research/papers) separates the papers whose use of
FEMU has been reviewed from the full list kept on the
[FEMU wiki](https://github.com/MoatLab/FEMU/wiki/Research-Papers-using-FEMU).

## Also say which FEMU

A citation identifies the idea; it does not identify the artifact. For a result
someone else should be able to reproduce, record the commit you ran and the
configuration you ran it with. See [reproducibility](/docs/research/reproducibility).

## Tell us

If your paper, course or product used FEMU, open an
[issue titled "Publication: "](https://github.com/MoatLab/FEMU/issues/new?title=Publication%3A%20)
followed by the title, with its publication link and the section describing
that use. The
[research page](/docs/research/papers) distinguishes implementations, evaluations,
model reuse, and comparisons.
