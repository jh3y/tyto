import TaskView from './task';
import BoardView from './board';
import ColumnView from './column';
import EditView from './edit';
import RootView from './root';
import MenuView from './menu';
import SelectView from './select';
import CookieBannerView from './cookie';
import TimeModalView from './time';

const Views = function(Views, App, Backbone) {
  Views.Root         = RootView;
  Views.Task         = TaskView;
  Views.Column       = ColumnView;
  Views.Board        = BoardView;
  Views.Edit         = EditView;
  Views.Menu         = MenuView;
  Views.Select       = SelectView;
  Views.CookieBanner = CookieBannerView;
  Views.TimeModal    = TimeModalView;
};

export default Views;
