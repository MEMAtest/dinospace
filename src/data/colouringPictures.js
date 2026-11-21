import { EXTRA_COLOURING_PICTURES } from './extraColouringPictures.js';

// Each region is independently paintable. Fine lines are a separate layer so
// colouring a material never paints over its texture or shape.
export const COLOURING_GROUPS = [
  { label: 'Animals', pictures: ['tiger', 'turtle', 'owl', 'butterfly', 'elephant', 'red-panda'] },
  { label: 'Shapes', pictures: ['kite', 'shape-garden', 'colour-star', 'hexagons', 'shape-flower', 'shape-mosaic'] },
  { label: 'Vehicles', pictures: ['rocket', 'truck', 'sailboat', 'plane', 'train', 'submarine'] },
];

export const COLOURING_PICTURES = {
  ...EXTRA_COLOURING_PICTURES,
  tiger: {
    label: 'Tiger',
    regions: [
      { id: 'tail', name: 'Tail', d: 'M627 548 C738 570 847 523 847 407 C847 374 825 355 806 365 C791 373 797 392 797 416 C797 478 731 506 649 490 Z' },
      { id: 'coat', name: 'Coat', d: 'M366 397 C300 432 306 532 339 581 C373 630 604 637 654 579 C692 535 677 445 621 404 C562 365 430 363 366 397 Z' },
      { id: 'chest', name: 'Chest fur', d: 'M411 413 C421 460 433 500 457 530 L474 518 L501 548 L523 520 L543 535 C574 502 575 456 594 411 C544 382 465 383 411 413 Z' },
      { id: 'left-paw', name: 'Left paw', d: 'M395 488 C385 522 389 562 367 582 C343 604 354 626 380 627 H455 C490 625 489 602 476 581 L477 538' },
      { id: 'right-paw', name: 'Right paw', d: 'M533 537 L535 580 C521 600 519 625 551 627 H627 C651 625 661 603 635 582 C609 559 617 517 605 489' },
      { id: 'ears', name: 'Outer ears', d: 'M365 217 C309 186 298 123 332 102 C366 80 420 107 432 143 Z M570 144 C591 102 643 80 674 105 C711 133 690 190 637 219 Z' },
      { id: 'inner-ears', name: 'Inner ears', d: 'M369 190 C336 174 330 139 347 130 C366 119 396 136 407 158 Z M594 159 C607 138 635 120 654 131 C675 144 658 176 630 191 Z' },
      { id: 'face', name: 'Face fur', d: 'M506 115 C422 110 361 157 347 226 C337 262 345 286 328 310 L350 307 L337 329 L366 325 C382 384 435 414 506 419 C575 419 629 388 644 329 L669 331 L655 308 L675 312 C658 283 666 265 655 223 C637 157 582 115 506 115 Z' },
      { id: 'muzzle', name: 'Cheeks and muzzle', d: 'M379 306 C403 277 450 277 489 312 L506 296 L525 310 C553 277 607 280 633 307 C632 365 577 407 506 411 C439 407 382 370 379 306 Z' },
      { id: 'eyes', name: 'Eyes', d: 'M406 249 C424 227 453 229 469 249 C447 270 426 270 406 249 Z M542 249 C562 227 589 230 603 251 C586 270 561 270 542 249 Z' },
      { id: 'nose', name: 'Nose', d: 'M477 306 Q505 297 533 305 Q534 315 510 332 Q506 337 501 332 Q477 318 477 306 Z' },
      { id: 'leaves', name: 'Jungle leaves', d: 'M185 592 C180 518 133 500 110 495 C113 551 140 580 185 592 Z M188 593 C195 522 235 500 261 499 C254 545 231 578 188 593 Z M754 597 C748 545 719 531 698 525 C698 570 725 591 754 597 Z M760 601 C779 549 816 546 832 547 C817 583 791 599 760 601 Z' },
    ],
    details: [
      { d: 'M417 170 Q451 159 482 171 L462 190 Q442 171 417 170 Z M491 123 Q507 141 517 126 L520 160 L507 151 L495 164 Z M529 169 Q565 154 598 169 Q569 172 545 190 Z M375 200 Q411 193 437 211 L413 222 Q399 204 375 200 Z M633 203 Q603 194 575 211 L598 223 Q612 207 633 203 Z M350 248 Q379 255 393 278 Q371 277 347 267 Z M663 249 Q637 255 620 277 Q643 278 664 267 Z M353 299 Q367 308 381 310 L370 330 L357 322 Z M651 299 Q641 308 628 312 L638 328 L649 322 Z M331 455 Q362 455 389 479 L374 491 Q344 478 326 479 Z M325 505 Q352 513 370 534 L351 546 L331 526 Z M653 456 Q631 459 615 481 L634 485 L667 474 Z M669 511 Q646 513 633 535 L650 548 L667 532 Z M762 494 Q781 483 793 470 Q797 487 798 503 L780 517 Z M797 435 L800 418 Q823 429 845 419 L844 439 Q817 451 797 435 Z M805 368 Q825 356 840 380 L847 400 Q822 404 798 391 Z', fill: '#303042' },
      { d: 'M436 241 Q433 250 438 259 M572 240 Q576 251 572 258 M506 333 V349 Q489 365 474 351 M506 349 Q523 365 538 351 M378 608 Q391 595 404 610 M417 608 Q430 595 443 610 M555 609 Q568 595 581 610 M592 609 Q605 595 619 610 M182 593 L170 556 M190 594 L218 555 M759 600 L780 573', width: 4 },
      { d: 'M401 329 Q365 321 338 336 M402 339 Q365 341 345 355 M607 328 Q649 320 681 334 M608 338 Q649 339 670 353 M444 325 l1 1 M452 337 l1 1 M464 323 l1 1 M548 323 l1 1 M561 336 l1 1 M568 324 l1 1', width: 3 },
      { region: 'face', d: 'M392 180 l16 -11 M403 182 l17 -11 M417 177 l15 -8 M589 177 l-15 -8 M602 182 l-17 -11 M614 185 l-17 -11 M385 352 l10 6 M390 367 l12 6 M616 352 l-10 6 M610 367 l-12 6', width: 3 },
      { region: 'coat', d: 'M354 427 l-12 12 M368 426 l-12 14 M370 444 l-19 12 M639 424 l14 11 M631 431 l16 13 M630 447 l18 13 M349 550 l10 10 M645 553 l-10 11', width: 3 },
      { region: 'chest', d: 'M436 477 l10 11 M448 478 l8 13 M456 503 l9 9 M481 498 l8 15 M501 508 v16 M523 496 l-7 14 M548 489 l-9 11 M558 471 l-9 13', width: 3 },
    ],
  },
  turtle: {
    label: 'Sea turtle',
    regions: [
      { id: 'flippers', name: 'Flippers', d: 'M376 412 C293 433 225 480 210 556 C294 564 348 538 399 491 Z M542 436 C617 445 684 484 697 552 C612 565 546 542 505 491 Z M374 274 C298 189 235 178 188 223 C218 273 269 318 353 335 Z M565 279 C602 209 690 165 731 191 C724 281 658 330 601 344 Z' },
      { id: 'head', name: 'Head', d: 'M600 328 C655 251 733 256 770 310 C803 359 783 403 745 422 C694 449 648 423 602 404 Z' },
      { id: 'shell', name: 'Shell edge', d: 'M275 376 C273 287 361 204 463 204 C572 204 648 277 652 368 C658 455 579 507 473 511 C366 516 285 465 275 376 Z' },
      { id: 'tiles', name: 'Shell plates', d: 'M305 373 C306 296 375 230 464 230 C558 230 618 293 623 371 C629 439 559 482 469 485 C373 486 311 447 305 373 Z' },
      { id: 'eye', name: 'Eye', d: 'M735 319 a14 14 0 1 0 0 28 a14 14 0 1 0 0 -28 Z' },
    ],
    details: [
      { d: 'M375 256 L404 310 L486 309 L526 252 M404 310 L365 370 L403 430 L487 434 L530 371 L486 309 M365 370 L307 383 M530 371 L625 362 M403 430 L383 466 M487 434 L521 478 M763 365 Q749 390 722 383 M735 326 v13', width: 5 },
      { region: 'flippers', d: 'M230 233 l12 7 M249 247 l12 7 M270 259 l12 7 M301 278 l12 7 M672 223 l9 -8 M650 238 l9 -8 M630 253 l9 -8 M258 527 l12 -10 M278 522 l12 -10 M628 521 l14 9 M651 530 l14 7', width: 4 },
    ],
  },
  kite: {
    label: 'Kite',
    regions: [
      { id: 'upper', name: 'Top of kite', d: 'M503 94 L284 294 H720 Z' },
      { id: 'left', name: 'Left of kite', d: 'M284 294 H503 V504 Z' },
      { id: 'right', name: 'Right of kite', d: 'M720 294 H503 V504 Z' },
      { id: 'ribbons', name: 'Ribbon bows', d: 'M514 551 l-40 -25 v46 l40 -19 l42 20 v-48 Z M556 609 l-38 -22 v45 l38 -20 l40 22 v-46 Z' },
    ],
    details: [{ d: 'M503 94 V504 Q487 541 520 554 T556 608 T541 655 M336 276 l152 -137 M520 316 v135', width: 5 }],
  },
  'shape-garden': {
    label: 'Shape garden',
    regions: [
      { id: 'sun', name: 'Circle sun', d: 'M768 94 a74 74 0 1 0 0 148 a74 74 0 1 0 0 -148 Z' },
      { id: 'hill', name: 'Triangle hill', d: 'M98 516 L303 201 L485 516 Z' },
      { id: 'wall', name: 'Rectangle house', d: 'M503 371 H764 V552 H503 Z' },
      { id: 'roof', name: 'Triangle roof', d: 'M470 371 L634 247 L798 371 Z' },
      { id: 'door', name: 'Door', d: 'M611 552 V449 H663 V552 Z' },
      { id: 'windows', name: 'Square windows', d: 'M533 407 H584 V458 H533 Z M691 407 H742 V458 H691 Z' },
      { id: 'meadow', name: 'Meadow', d: 'M98 552 H865 V602 H98 Z' },
    ],
    details: [{ d: 'M775 60 v-28 M855 95 l22 -20 M873 167 h27 M855 239 l22 20 M678 92 l-22 -20 M674 167 h-27 M555 407 v51 M715 407 v51 M533 432 h51 M691 432 h51 M650 502 h1', width: 5 }],
  },
  rocket: {
    label: 'Rocket',
    regions: [
      { id: 'flame', name: 'Flame', d: 'M438 509 C426 567 465 629 500 667 C544 630 575 566 563 509 Z' },
      { id: 'flame-core', name: 'Flame centre', d: 'M475 517 C465 566 488 594 500 618 C520 588 534 550 525 517 Z' },
      { id: 'fins', name: 'Fins', d: 'M426 336 C341 378 327 463 318 521 L427 469 Z M574 336 C659 378 673 463 682 521 L573 469 Z' },
      { id: 'body', name: 'Rocket body', d: 'M500 62 C395 168 383 338 432 512 H568 C617 338 605 168 500 62 Z' },
      { id: 'nose', name: 'Nose cone', d: 'M433 160 Q460 101 500 62 Q540 101 567 160 Q499 185 433 160 Z' },
      { id: 'rim', name: 'Window rim', d: 'M500 212 a59 59 0 1 0 0 118 a59 59 0 1 0 0 -118 Z' },
      { id: 'glass', name: 'Window glass', d: 'M500 230 a41 41 0 1 0 0 82 a41 41 0 1 0 0 -82 Z' },
      { id: 'band', name: 'Engine band', d: 'M420 464 Q500 482 580 464 L568 512 H432 Z' },
    ],
    details: [{ d: 'M485 245 q-15 7 -18 24 M480 273 q2 11 9 16 M454 486 h8 M479 490 h8 M513 490 h8 M540 486 h8 M227 206 v48 M203 230 h48 M761 146 v38 M742 165 h38 M759 380 v44 M737 402 h44', width: 5 }],
  },
  truck: {
    label: 'Truck',
    regions: [
      { id: 'chassis', name: 'Chassis', d: 'M154 414 H828 V491 H154 Z' },
      { id: 'box', name: 'Truck box', d: 'M181 213 H558 V428 H181 Z' },
      { id: 'cab', name: 'Cab', d: 'M557 282 H678 L759 379 H800 Q828 381 828 410 V463 H557 Z' },
      { id: 'window', name: 'Window', d: 'M580 306 H666 L723 375 H580 Z' },
      { id: 'lamps', name: 'Lamps', d: 'M772 407 H825 V435 H772 Z M154 439 H184 V462 H154 Z' },
      { id: 'wheels', name: 'Tyres', d: 'M271 520 a62 62 0 1 0 0 -124 a62 62 0 1 0 0 124 Z M688 520 a62 62 0 1 0 0 -124 a62 62 0 1 0 0 124 Z' },
      { id: 'hubs', name: 'Wheel hubs', d: 'M271 491 a33 33 0 1 0 0 -66 a33 33 0 1 0 0 66 Z M688 491 a33 33 0 1 0 0 -66 a33 33 0 1 0 0 66 Z' },
    ],
    details: [{ d: 'M219 245 H518 M219 272 H518 M619 321 l31 36 M581 401 h43 M178 555 H831 M272 445 v26 M259 458 h26 M689 445 v26 M676 458 h26', width: 5 }],
  },
};
