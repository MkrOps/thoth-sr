var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import Rete from "rete";
import { ThothReteComponent } from "./ThothReteComponent";
import { stringSocket, triggerSocket } from "../sockets";
import { FewshotControl } from "../dataControls/FewshotControl";
// For simplicity quests should be ONE thing not complete X and Y
var fewshot = "Given an action, detect the item which is taken.\n\nAction, Item: pick up the goblet from the fountain, goblet\nAction, Item: grab the axe from the tree stump, axe\nAction, Item: lean down and grab the spear from the ground, spear\nAction, Item: gather the valerian plant from the forest, valerian plant\nAction, Item: get the necklace from the box, necklace\nAction, Item: ";
var info = "The item detector attempts to recognize what item in a give text string is being mentioned or used.  The input is a text string the output is a string of the object";
var ItemTypeComponent = /** @class */ (function (_super) {
    __extends(ItemTypeComponent, _super);
    function ItemTypeComponent() {
        var _this = 
        // Name of the component
        _super.call(this, "Item Detector") || this;
        _this.task = {
            outputs: { detectedItem: "output", trigger: "option" },
            init: function (task) { },
        };
        _this.category = "AI/ML";
        _this.display = true;
        _this.info = info;
        return _this;
    }
    ItemTypeComponent.prototype.builder = function (node) {
        node.data.fewshot = fewshot;
        var inp = new Rete.Input("string", "Text", stringSocket);
        var out = new Rete.Output("detectedItem", "Item Detected", stringSocket);
        var dataInput = new Rete.Input("trigger", "Trigger", triggerSocket);
        var dataOutput = new Rete.Output("trigger", "Trigger", triggerSocket);
        var fewshotControl = new FewshotControl({});
        node.inspector.add(fewshotControl);
        return node
            .addInput(inp)
            .addInput(dataInput)
            .addOutput(dataOutput)
            .addOutput(out);
    };
    ItemTypeComponent.prototype.worker = function (node, inputs, outputs, _a) {
        var silent = _a.silent, thoth = _a.thoth;
        return __awaiter(this, void 0, void 0, function () {
            var completion, action, prompt, body, raw, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        completion = thoth.completion;
                        action = inputs["string"][0];
                        prompt = node.data.fewshots + action + ",";
                        body = {
                            prompt: prompt,
                            stop: ["\n"],
                            maxTokens: 100,
                            temperature: 0.0,
                        };
                        return [4 /*yield*/, completion(body)];
                    case 1:
                        raw = _b.sent();
                        result = raw === null || raw === void 0 ? void 0 : raw.trim();
                        if (!silent)
                            node.display(result);
                        return [2 /*return*/, {
                                detectedItem: result,
                            }];
                }
            });
        });
    };
    return ItemTypeComponent;
}(ThothReteComponent));
export { ItemTypeComponent };
