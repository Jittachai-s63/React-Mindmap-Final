import pptxgen from "pptxgenjs";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Popup from "reactjs-popup";
import { margin } from "@mui/system";

export default function Select(props) {
  let pres = new pptxgen();
  let data = JSON.parse(localStorage.getItem("selectpresent"));
  let Allnode = data.Allnode;
  let Root = { ...data.Root };
  let Roottemp = {};
  let newAllnode = {};

  const [itemlist, setitemState] = useState([]);
  const [disableState, setDisableState] = useState([]);

  const [checkedState, setCheckedState] = useState([]);

  useEffect(() => {
    const DFSitem = (Root, Allnode) => {
      for (let i = 0; i < Root.child.length; i++) {
        let next = Root.child[i];
        for (let j = 0; j < Allnode.length; j++) {
          if (next === Allnode[j].key) {
            setitemState([...itemlist, Allnode[j].topic]);
            itemlist.push(Allnode[j].topic);
            DFSitem(Allnode[j], Allnode);
          }
        }
      }
    };
    DFSitem(Root, Allnode);

    setDisableState(Array(itemlist.length).fill(false));
    setCheckedState(Array(itemlist.length).fill(true));
  }, []);

  const handleOnChange = (position, topic) => {
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    const updateddisState = disableState.map((item, index) => item);
    let run = 0;
    const DFSsearch = async (Root, Allnode, child) => {
      for (let i = 0; i < Root.child.length; i++) {
        let next = Root.child[i];

        for (let j = 0; j < Allnode.length; j++) {
          if (next === Allnode[j].key) {
            if (Allnode[j].topic == topic) {
              child = 1;
            } else if (child) {
              updatedCheckedState[run] = updatedCheckedState[position];
              updateddisState[run] = !updatedCheckedState[run];
              child++;
            }
            run++;
            DFSsearch(Allnode[j], Allnode, child);
            if (child == 1) child--;
          }
        }
      }
    };
    DFSsearch(Root, Allnode, 0);
    setCheckedState(updatedCheckedState);
    setDisableState(updateddisState);
  };

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
    DFS(Roottemp, newAllnode);
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

  const exportsecelcslide = () => {
    newAllnode = [];
    Roottemp = { ...Root };
    let temp = [];
    for (let i = 0; i < itemlist.length; i++) {
      if (checkedState[i]) {
        for (let j = 0; j < Allnode.length; j++) {
          if (itemlist[i] == Allnode[j].topic) {
            newAllnode.push(Allnode[j]);
            if (Root.child.indexOf(Allnode[j].key) > -1) {
              temp.push(Allnode[j].key);
            }
          }
        }
      }
    }
    Roottemp.child = temp;
    createslide();
  };

  const previewslide = () => {
    newAllnode = [];
    Roottemp = { ...Root };
    let temp = [];
    for (let i = 0; i < itemlist.length; i++) {
      if (checkedState[i]) {
        for (let j = 0; j < Allnode.length; j++) {
          if (itemlist[i] == Allnode[j].topic) {
            newAllnode.push(Allnode[j]);
            if (Root.child.indexOf(Allnode[j].key) > -1) {
              temp.push(Allnode[j].key);
            }
          }
        }
      }
    }
    Roottemp.child = temp;
  };

  // const moredetail = (topic) => {
  //   console.log(topic);
  // };

  return (
    <div className="App">
      <h1>Select Topic Export Slide</h1>
      <h2>{Root.topic}</h2>
      <ul className="toppings-list">
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
                    disabled={disableState[index]}
                    onChange={() => handleOnChange(index, topic)}
                  />
                  {topic.length < 50 ? (
                    <label>{topic}</label>
                  ) : (
                    <>
                      <label>{topic.slice(0, 50)}... </label>

                      <Popup
                        trigger={(open) => (
                          <AddBoxIcon sx={{ fontSize: 20 }}></AddBoxIcon>
                        )}
                        position="right center"
                        closeOnDocumentClick
                        on="hover"
                        mouseLeaveDelay={300}
                        mouseEnterDelay={0}
                      >
                        <div
                          style={{
                            backgroundColor: "#e9e9e2",
                            width: 500,
                            borderRadius: "20px",
                          }}
                        >
                          <div style={{ margin: "15px" }}>
                            <p>{topic}</p>
                          </div>
                        </div>
                      </Popup>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <br></br>
      <div className="button-div">
        <button class="button" onClick={exportsecelcslide}>
          <span>Export </span>
        </button>

        <Link
          to="/present"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            localStorage.setItem(
              "present",
              JSON.stringify({ Root: Roottemp, Allnode: newAllnode })
            )
          }
        >
          <button
            class="button"
            //style="vertical-align:middle"
            onClick={previewslide}
          >
            <span>Preview </span>
          </button>
        </Link>
      </div>
    </div>
  );
}
