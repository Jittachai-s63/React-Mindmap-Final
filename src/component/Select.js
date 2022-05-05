import pptxgen from "pptxgenjs";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Select(props) {
  let pres = new pptxgen();
  let data = JSON.parse(localStorage.getItem("selectpresent"));
  let Allnode = data.Allnode;
  let Root = data.Root;
  let Roottemp = {};
  let selitem = [];

  const [checkedState, setCheckedState] = useState(
    new Array(Root.child.length).fill(true)
  );

  const [orderstate, setOrderState] = useState(
    Array.from(Array(Root.child.length).keys())
  );

  const handleOnChange = (position) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );

    setCheckedState(updatedCheckedState);
  };

  let itemlist = [];
  for (let i = 0; i < Root.child.length; i++) {
    let next = Root.child[i];
    for (let j = 0; j < Allnode.length; j++) {
      if (next === Allnode[j].key) {
        itemlist.push(Allnode[j].topic);
        break;
      }
    }
  }

  const DFS = async (cur, Allnode) => {
    if (cur.child.length === 0) {
      return;
    } else {
      let slide = pres.addSlide();
      slide.addText(cur.topic, {
        x: 1.5,
        y: 0.5,
        fontSize: 20,
        bold: true,
        color: "363636",
        align: pres.AlignH.top,
      });

      let text = [];
      for (let i = 0; i < cur.child.length; i++) {
        let next = cur.child[i];
        //find child in list
        for (let j = 0; j < Allnode.length; j++) {
          if (next === Allnode[j].key) {
            //text is more than 800
            if (Allnode[j].topic.length > 800) {
              text.push(Allnode[j].topic.replaceAll("\n", "").substring(800));
              // create another slide to add text
              let subslide = pres.addSlide();
              subslide.addText(cur.topic + "(ต่อ)", {
                x: 1.5,
                y: 0.5,
                fontSize: 20,
                bold: true,
                color: "363636",
                align: pres.AlignH.top,
              });
              subslide.addText(text.toString().replaceAll(",", "\n"), {
                x: 1.5,
                y: 2.5,
                color: "363636",
                align: pres.AlignH.left,
                softBreakBefore: true,
              });

              text = [];
              text.push(
                Allnode[j].topic.replaceAll("\n", "").substring(0, 800)
              );
            } else {
              //text is less than 800
              text.push(Allnode[j].topic.replaceAll("\n", ""));
            }
            //Depth-first search
            DFS(Allnode[j], Allnode);
          }
        }
      }
      //add text to detail slide
      slide.addText(
        text
          .slice(0, 9)
          .toString()
          .replaceAll(",", "\n"),
        {
          x: 1.5,
          y: 2.5,
          color: "363636",
          align: pres.AlignH.left,
          bullet: true,
          softBreakBefore: true,
        }
      );
      //create another slide to add text when have more then 9 topic
      pres.defineSlideMaster({
        title: "PLACEHOLDER_SLIDE",
        background: { color: "FFFFFF" },
        objects: [
          {
            placeholder: {
              options: {
                name: "body",
                type: "body",
                x: 1.5,
                y: 1.0,
                w: 12,
                h: 5.25,
                fontSize: 18,
                color: "363636",
                align: pres.AlignH.left,
                bullet: true,
                softBreakBefore: true,
              },

              text: "(custom placeholder text!)",
            },
          },
        ],
      });
      if (text.length > 9) {
        let subslide = pres.addSlide({ masterName: "PLACEHOLDER_SLIDE" });
        subslide.addText(cur.topic + "(ต่อ)", {
          x: 1.5,
          y: 0.5,
          fontSize: 20,
          bold: true,
          color: "363636",
          align: pres.AlignH.top,
        });
        subslide.addText(
          text
            .slice(9)
            .toString()
            .replaceAll(",", "\n"),
          {
            placeholder: "body",
          }
        );
      }
    }
  };

  const createslide = () => {
    let slide = pres.addSlide();
    slide.addText(Roottemp.topic, {
      x: 1.5,
      y: 2.5,
      color: "#363636",
      fill: { color: "F1F1F1" },
      align: pres.AlignH.center,
      fontSize: 30,
    });
    DFS(Roottemp, Allnode);
    let endslide = pres.addSlide();
    endslide.addText("Thank you", {
      x: 1.5,
      y: 2.5,
      color: "#363636",
      fill: { color: "F1F1F1" },
      align: pres.AlignH.center,
      fontSize: 30,
    });
    pres.writeFile({ fileName: Roottemp.topic + ".pptx" });
  };

  const getselect = () => {
    let temp = [];
    for (let i = 0; i < checkedState.length; i++) {
      if (checkedState[i] == true) {
        for (let j = 0; j < Allnode.length; j++) {
          if (Root.child[i] === Allnode[j].key) {
            temp.push(Allnode[j].topic);
            break;
          }
        }
      }
    }
    selitem = [...temp];
  };

  const exportsecelcslide = () => {
    let temp = [];
    Roottemp = { ...Root };
    for (let i = 0; i < Root.child.length; i++) {
      if (checkedState[i] == true) {
        temp.push(Root.child[i]);
      }
    }
    Roottemp.child = temp;
    createslide();
  };

  const previewslide = () => {
    let temp = [];
    Roottemp = { ...Root };
    console.log(Root);
    for (let i = 0; i < Root.child.length; i++) {
      if (checkedState[i] == true) {
        temp.push(Root.child[i]);
      }
    }
    Roottemp.child = temp;
    console.log(Root);
    console.log(Roottemp);
  };

  return (
    <div>
      <h1>Select topic export slide</h1>
      <h2>{Root.topic}</h2>
      <ul className="slide-list">
        {itemlist.map((topic, index) => {
          return (
            <li key={index}>
              <div className="toppings-list-item">
                <div className="left-section">
                  <input
                    type="checkbox"
                    id={`custom-checkbox-${index}`}
                    name={topic}
                    value={topic}
                    checked={checkedState[index]}
                    onChange={() => handleOnChange(index)}
                  />
                  <label htmlFor={`custom-checkbox-${index}`}>{topic}</label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div>
        <h1>Select order export slide</h1>
        {getselect()}
        <ul>
          {selitem.map((topic, index) => {
            return (
              <li key={index}>
                <div className="toppings-list-item">
                  <div className="left-section">
                    <input
                      type="number"
                      id={`custom-checkbox-${index}`}
                      name={topic}
                      value={index + 1}
                      //onChange={() => handleOnChange(index)}
                    />
                    <label htmlFor={`custom-checkbox-${index}`}>{topic}</label>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <button onClick={exportsecelcslide}>Export</button>
        <Link
          to="/present"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            localStorage.setItem(
              "present",
              JSON.stringify({ Root: Roottemp, Allnode: Allnode })
            )
          }
        >
          <button onClick={previewslide}>Preview</button>
        </Link>
      </div>
    </div>
  );
}
